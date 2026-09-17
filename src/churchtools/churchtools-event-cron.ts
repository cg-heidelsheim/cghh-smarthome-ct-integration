import {RoomConfigDB} from '../db/room-config.db';
import {HomematicApi} from './../homematic/homematic-api';
import {LockDB} from '../db/lock.db';
import {LockManager} from '../churchtools/lock-manager';
import {EventManager} from '../churchtools/event-manager';
import {GroupStateDB} from '../db/group-state.db';
import {EventRoomConfigDB} from '../db/event-room-configuration.db';
import {Uptime} from '../../uptime';
import {Logger} from '../util/logger';

require('dotenv').config();
require('../util/timezone.bootstrap');

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
