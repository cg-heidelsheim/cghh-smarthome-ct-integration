// classes
const { EventLogger } = require("../util/event.logger");
const { RoomConfigDB } = require('../db/room-config.db');

// elements
// other
require('dotenv').config();
const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Berlin");

const { HomematicApi } = require("./../homematic/homematic-api");

const { LockDB } = require("../db/lock.db");
const { LockManager } = require("../churchtools/lock-manager");
const { EventManager } = require("../churchtools/event-manager");
const { GroupStateDB } = require("../db/group-state.db");
const { Uptime } = require("../../uptime");
const { Logger } = require("../util/logger");


/** ------------------- */
/** ------ ENTRY ------ */
/** ------------------- */

/**
 * @type RoomConfigDB
 */
let roomConfigurationDB;

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

    const eventManager = new EventManager(lockDB, roomConfigDB, groupStateDB);
    await eventManager.handleEvents();
}

/**
 * Initialize run for heating adjustment
 */
async function execute() {
    roomConfigurationDB = new RoomConfigDB();

    await manageLocks();
    await manageCTEvents();
}

/**
 * TODO
 * If no lock exists for the room, reset it to idle
 */
async function resetEverythingIfNotLocked(earlierResetNotPossible) {
    const roomConfigs = roomConfigurationDB.getAll();
    const homematicAPI = new HomematicApi();
    const resetNotPossible = {};

    // set boolean if this reset is a retry (if ealier one reset didnt work)
    const earlierResetNotPossibleBool = Object.keys(earlierResetNotPossible).length > 0;

    for (const roomConfig of roomConfigs) {
        const hmip_groupId = roomConfig.homematicId;

        let tags = { module: "CRON", function: "RESET", group: roomConfig.name.replace(/ /g, '_') };
        Logger.debug({ tags, message: `Handling room ` + JSON.stringify(roomConfig) });

        // dont reset, if previous reset worked
        if (earlierResetNotPossibleBool && earlierResetNotPossible[hmip_groupId] === undefined) {
            Logger.debug({ tags, message: `Previous reset worked - SKIP - ${earlierResetNotPossibleBool} - ${earlierResetNotPossible[hmip_groupId]}` }); 
            continue;
        }

        try {
            try {
                const lockDB = new LockDB();
                lockDB.getByGroupId(hmip_groupId);
                Logger.warn({ tags, message: `Room reset not possible - LOCKED` });
                continue; // element is locked - dont reset
            } catch (e) {
                Logger.debug({ tags, message: e });
                await homematicAPI.setTemperatureForGroup(hmip_groupId, roomConfig.desiredTemperatureIdle);
                Logger.debug({ tags, message: `Room reset successful` });
                delete resetNotPossible[hmip_groupId];
            }
        } catch (e) {
            Uptime.pingUptime("down", "Can not reset " + roomConfig.homematicName, "CRON");
            Logger.error({ tags, message: `Room reset not possible: ${e}` });
            resetNotPossible[hmip_groupId] = true;
        }
    }

    return resetNotPossible;
}


module.exports = { execute, resetEverythingIfNotLocked };
