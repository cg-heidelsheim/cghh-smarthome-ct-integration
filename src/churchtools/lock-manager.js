const {Logger} = require("../util/logger");
const {Lock} = require("../db/model/lock");
const {LockDB} = require("../db/lock.db");
const {RoomConfigDB} = require("../db/room-config.db");
const {GroupManagerFactory} = require("../homematic/group/group-manager.factory")
const {EventLogger} = require("../util/event.logger");

class LockManager {
    tags = {module: "CRON", function: "LOCKS"};

    /**
     * @param {LockDB} lockDB
     * @param {RoomConfigDB} roomConfigDB
     */
    constructor(lockDB, roomConfigDB) {
        this.lockDB = lockDB;
        this.roomConfigDB = roomConfigDB;
    }

    /**
     * Manage locks for all rooms.
     * @returns {Promise<void>}
     */
    async manageLocks() {
        Logger.debug({tags: this.tags, message: "Starting lock resolving"});

        const locks = this.lockDB.getAll();
        Logger.info({tags: this.tags, message: "Number of locks: " + locks.length});

        for (const lock of locks) {
            await this.#manageLock(lock);
        }

        Logger.debug({tags: this.tags, message: "Finished lock resolving"});
    }

    /**
     * Manage lock.
     * Checks if the log is expired.
     * If expired, delete it, and reset the corresponding room
     *
     * @param {Lock} lock
     * @returns {Promise<void>}
     */
    async #manageLock(lock) {
        const roomConfig = this.roomConfigDB.getById(lock.id);
        const tags = {...this.tags, group: roomConfig.name.replace(/ /g, "_")};

        if (!lock.isExpired()) {
            Logger.debug({tags, message: "Lock not expired - SKIP"});
        }

        Logger.debug({tags, message: "Lock expired - Reset Group"});

        try {
            const groupManager = GroupManagerFactory.createGroupManager(lock.id);
            await groupManager.setToIdle(lock.eventName);

            this.lockDB.deleteById(lock.id);

            Logger.debug({tags, message: "Lock resolve success"});

            EventLogger.resolveLock(groupManager.groupState.label, roomConfig.desiredTemperatureIdle, lock);
        } catch (e) {
            Logger.error({tags, message: "Lock resolve failed: " + e});
            throw new Error("Cannot set room to idle");
        }
    }
}

module.exports = {LockManager};
