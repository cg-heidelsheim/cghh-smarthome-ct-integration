import {PendingLogDB} from '../../db/pending-log.db';
import {Logger} from '../../util/logger';
import {PendingLog} from '../../db/model/pending-log';
import type {RoomConfig} from '../../db/model/room-config';
import type {GroupState} from '../../db/model/group-state';
import type {HomematicApi} from '../homematic-api';
import type {Event} from '../../churchtools/model/event';
import type {EventRoomConfig} from '../../db/model/event-room-config.model';

interface GroupManagerParams {
    roomConfiguration: RoomConfig;
    roomState: GroupState;
    homematicAPI: HomematicApi;
}

/**
 * TODO REFACTOR
 */
export class GroupManager {

    roomConfiguration: RoomConfig;
    groupState: GroupState;
    homematicAPI: HomematicApi;

    constructor(params: GroupManagerParams) {
        this.roomConfiguration = params.roomConfiguration;
        this.groupState = params.roomState;

        this.homematicAPI = params.homematicAPI;
    }

    async setToIdle(eventName: string) {
        const desiredTemperature = this.roomConfiguration.desiredTemperatureIdle;
        await this.updateTemperature(desiredTemperature, eventName);
    }

    /**
     * @throws {Error} If room is currently heated (may happen if somebody changes temperature between events)
     */
    async heatForEvent(event: Event, eventRoomConfigs: EventRoomConfig[]) {
        const desiredTemperature = this.roomConfiguration.getDesiredRoomTemperatureForEvent(event, eventRoomConfigs);

        // check if temp is currently manually changed
        const temperatureIsManuallyChanged = this.groupState.setTemperature !== this.roomConfiguration.desiredTemperatureIdle;

        const currentTemperatureIsDefined = this.groupState.setTemperature !== undefined;
        if (temperatureIsManuallyChanged && currentTemperatureIsDefined) {
            if (process.env.ENVIRONMENT === 'production') {
                throw new Error('Blocked');
            } else if (process.env.ENVIRONMENT !== 'production') {
                if (this.groupState.setTemperature === desiredTemperature) {
                    Logger.warn({message: 'ATTENTION: Assumed no manual change, since setTemp === desiredTemp'});
                } else {
                    throw new Error('Blocked');
                }
            }
        }

        await this.updateTemperature(desiredTemperature, event.name);
    }

    async updateTemperature(desiredTemperature: number, eventName: string) {
        const tags = {module: 'CRON', function: 'EVENT', group: this.roomConfiguration.homematicId};
        // set before data send, otherwise websocket might trigger before lock is set
        const pendingLogDb = new PendingLogDB();
        const pendingLog = new PendingLog();
        pendingLog.id = this.roomConfiguration.homematicId;
        pendingLog.eventName = eventName;
        pendingLogDb.save(pendingLog);

        try {
            await this.homematicAPI.setTemperatureForGroup(this.roomConfiguration.homematicId, desiredTemperature);

            Logger.debug({
                tags,
                message: `Set temperature of ${this.roomConfiguration.homematicId} to ${desiredTemperature}`
            });
        } catch (e) {
            Logger.error({
                tags,
                message: `Can't set temperature of ${this.roomConfiguration.homematicId} to ${desiredTemperature}: ${e}`
            });

            // revert pending log
            pendingLogDb.deleteById(this.roomConfiguration.homematicId);
            throw new Error('Cannot set Temperature to idle');
        }
    }

}
