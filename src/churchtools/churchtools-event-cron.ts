import {RoomConfigDB} from '../db/room-config.db';
import {HomematicApi} from './../homematic/homematic-api';
import {LockDB} from '../db/lock.db';
import {LockManager} from '../churchtools/lock-manager';
import {EventManager} from '../churchtools/event-manager';
import {GroupStateDB} from '../db/group-state.db';
import {EventRoomConfigDB} from '../db/event-room-configuration.db';
import {Uptime} from '../../uptime';
import {Logger} from '../util/logger';
import {EnvironmentManager} from '../util/environment-manager';
import moment from '../util/timezone.bootstrap';

require('dotenv').config();

/** ------------------- */
/** ------ ENTRY ------ */
/** ------------------- */

async function manageLocks() {
    const roomConfigDB = new RoomConfigDB();
    const lockDB = new LockDB();

    const lockManager = new LockManager(lockDB, roomConfigDB);
    await lockManager.manageLocks();
}

async function manageCTEvents() {
    const roomConfigDB = new RoomConfigDB();
    const lockDB = new LockDB();
    const groupStateDB = new GroupStateDB();
    const eventRoomConfigDB = new EventRoomConfigDB();

    const eventManager = new EventManager(lockDB, roomConfigDB, groupStateDB, eventRoomConfigDB);
    await eventManager.handleEvents();
}

/**
 * Initialize run for heating adjustment
 */
export async function execute() {
    await manageLocks();
    await manageCTEvents();
}

/**
 * If no lock exists for the room, reset it to idle
 */
export async function resetEverythingIfNotLocked(earlierResetNotPossible: Record<string, boolean>): Promise<Record<string, boolean>> {
    const roomConfigurationDB = new RoomConfigDB();
    const lockDB = new LockDB();
    const roomConfigs = roomConfigurationDB.getAll();
    const homematicAPI = new HomematicApi();
    const resetNotPossible: Record<string, boolean> = {};

    // set boolean if this reset is a retry (if earlier one reset didn't work)
    const earlierResetNotPossibleBool = Object.keys(earlierResetNotPossible).length > 0;

    for (const roomConfig of roomConfigs) {
        const hmip_groupId = roomConfig.homematicId;

        const tags = {module: 'CRON', function: 'RESET', group: roomConfig.name.replace(/ /g, '_')};
        Logger.debug({tags, message: 'Handling room ' + JSON.stringify(roomConfig)});

        // dont reset, if previous reset worked
        if (earlierResetNotPossibleBool && earlierResetNotPossible[hmip_groupId] === undefined) {
            Logger.debug({
                tags,
                message: `Previous reset worked - SKIP - ${earlierResetNotPossibleBool} - ${earlierResetNotPossible[hmip_groupId]}`
            });
            continue;
        }

        if (lockDB.tryGetById(hmip_groupId)) {
            Logger.warn({tags, message: 'Room reset not possible - LOCKED'});
            continue;
        }

        try {
            await homematicAPI.setTemperatureForGroup(hmip_groupId, roomConfig.desiredTemperatureIdle);
            Logger.debug({tags, message: 'Room reset successful'});
            delete resetNotPossible[hmip_groupId];
        } catch (e) {
            Uptime.pingUptime('down', 'Can not reset ' + roomConfig.homematicName, 'CRON');
            Logger.error({tags, message: `Room reset not possible: ${e}`});
            resetNotPossible[hmip_groupId] = true;
        }
    }

    return resetNotPossible;
}

/**
 * The full cron-tick logic: at HH:00, retry the nightly reset up to 3 times (refreshing the
 * Homematic server URLs between attempts, in case they changed); then always run the regular
 * heating-decision pass (`execute()`). Pings Uptime Kuma with the outcome of the `execute()`
 * step either way.
 *
 * Moved here from index.ts, which should only wire things up and start them, not contain
 * this retry-loop's actual domain logic.
 */
export async function executeCron(): Promise<void> {
    const generalTags = {module: 'CRON', function: 'GENERAL'};
    Logger.info({tags: generalTags, message: '======= Starting Cronjob ======='});

    const maxTries = 3;
    let resetNotPossible: Record<string, boolean> = {};

    // try reset if failed earlier
    // or its 0 o'clock
    if (moment().hours() === 0 && moment().minutes() === 0 || Object.keys(resetNotPossible).length > 0) {
        for (let count = 1; count <= maxTries; count++) {
            const resetTags = {module: 'CRON', function: 'RESET', attempt: count};
            Logger.info({tags: resetTags, message: 'Starting nightly reset'});

            try {
                resetNotPossible = await resetEverythingIfNotLocked(resetNotPossible);

                if (Object.keys(resetNotPossible).length > 0) {
                    throw new Error(`Cant reset ${Object.keys(resetNotPossible).length} elements`); // gets caught directly
                }

                Logger.info({tags: resetTags, message: 'Finished nightly reset'});
                break;
            } catch (e) {
                if (count === maxTries) {
                    Logger.error({tags: resetTags, message: e.message});
                    Uptime.pingUptime('down', e, 'CRON');
                    break;
                } else {
                    Logger.warn({tags: resetTags, message: e.message});
                }

                await EnvironmentManager.updateServerVariables();
            }
        }
    }

    const tags = {module: 'CRON', function: 'EXECUTE'};
    try {
        await execute();
        Uptime.pingUptime('up', 'OK', 'CRON');
    } catch (e) {
        Logger.error({tags, message: 'Failed event handling: ' + e.message});
        Uptime.pingUptime('down', e, 'CRON');
    }
}
