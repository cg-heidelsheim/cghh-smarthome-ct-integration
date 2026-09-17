import {Logger} from '../util/logger';
import {GroupManagerFactory} from '../homematic/group/group-manager.factory';
import {EventLogger} from '../util/event.logger';
import type {LockDB} from '../db/lock.db';
import type {RoomConfigDB} from '../db/room-config.db';
import type {Lock} from '../db/model/lock';

export class LockManager {
    tags = {module: 'CRON', function: 'LOCKS'};
    lockDB: LockDB;
    roomConfigDB: RoomConfigDB;

    constructor(lockDB: LockDB, roomConfigDB: RoomConfigDB) {
        this.lockDB = lockDB;
        this.roomConfigDB = roomConfigDB;
    }

    /**
     * Manage locks for all rooms.
     */
    async manageLocks(): Promise<void> {
        Logger.info({tags: this.tags, message: 'Starting lock resolving'});

        const locks = this.lockDB.getAll();
        Logger.info({tags: this.tags, message: 'Number of locks: ' + locks.length});

        for (const lock of locks) {
            await this.#manageLock(lock);
        }

        Logger.info({tags: this.tags, message: 'Finished lock resolving'});
    }

    /**
     * Manage lock.
     * Checks if the log is expired.
     * If expired, delete it, and reset the corresponding room
     */
    async #manageLock(lock: Lock): Promise<void> {
        const roomConfig = this.roomConfigDB.getById(lock.id);
        const tags = {...this.tags, group: roomConfig.name.replace(/ /g, '_')};

        if (!lock.isExpired()) {
            Logger.debug({tags, message: `Room '${roomConfig.name}' - Lock not expired`});
            return;
        }

        Logger.info({tags, message: `Room '${roomConfig.name}' - Lock expired - Reset`});

        try {
            const groupManager = GroupManagerFactory.createGroupManager(lock.id);
            await groupManager.setToIdle(lock.eventName);

            this.lockDB.deleteById(lock.id);

            Logger.debug({tags, message: `Room '${roomConfig.name}' - Lock resolve success`});

            EventLogger.resolveLock(groupManager.groupState.label, roomConfig.desiredTemperatureIdle, lock);
        } catch (e) {
            Logger.error({tags, message: `Room '${roomConfig.name}' - Lock resolve failed: ${e}`});
            // throw new Error("Cannot set room to idle");
        }
    }
}
