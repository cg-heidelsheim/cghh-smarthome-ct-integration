const { PendingLogDB } = require("../../db/pending-log.db");
const { Logger } = require("../../util/logger");
const { HomematicApi } = require("../homematic-api");
const { GroupState } = require("../../db/model/group-state");
const {PendingLog} = require("../../db/model/pending-log");

/**
 * TODO REFACTOR
 */
class GroupManager {

    /** @type {RoomConfig} */
    roomConfiguration;
    /** @type {GroupState} */
    groupState;
    /** @type {HomematicApi} */
    homematicAPI;

    constructor(roomConfiguration, roomState) {
        this.roomConfiguration = roomConfiguration;
        this.groupState = roomState;

        this.homematicAPI = new HomematicApi();
    }

    async setToIdle(eventName) {
        const desiredTemperature = this.roomConfiguration.desiredTemperatureIdle;
        await this.updateTemperature(desiredTemperature, eventName);
    }

    /**
     * @param {*} event 
     * @throws {Error} If room is currently heated (may happen if somebody changes temperature between events)
     */
    async heatForEvent(event) {
        const desiredTemperature = this.roomConfiguration.getDesiredRoomTemperatureForEvent(event);

        // check if temp is currently manually changed
        const temperatureIsManuallyChanged = this.groupState.setTemperature !== this.roomConfiguration.desiredTemperatureIdle;
        const currentTemperatureIsDefined = this.groupState.setTemperature !== undefined;
        if (temperatureIsManuallyChanged && currentTemperatureIsDefined) throw new Error("Blocked");

        await this.updateTemperature(desiredTemperature, event.bezeichnung);
    }

    async updateTemperature(desiredTemperature, eventName) {
        const tags = {module: "CRON", function: "EVENT", group: this.roomConfiguration.homematicId};
        // set before data send, otherwise websocket might trigger before lock is set
        const pendingLogDb = new PendingLogDB();
        const pendingLog = new PendingLog();
        pendingLog.id = this.roomConfiguration.homematicId;
        pendingLog.eventName = eventName;
        pendingLogDb.save(pendingLog);

        try {
            await this.homematicAPI.setTemperatureForGroup(this.roomConfiguration.homematicId, desiredTemperature);

            Logger.debug({ tags, message: `Set temperature of ${this.roomConfiguration.homematicId} to ${desiredTemperature}` });
        } catch (e) {
            Logger.error({ tags, message: `Can't set temperature of ${this.roomConfiguration.homematicId} to ${desiredTemperature}: ${e}` });

            // revert pending log
            pendingLogDb.delete(this.roomConfiguration.homematicId);
            throw new Error("Cannot set Temperature to idle");
        }
    }

}

module.exports = { GroupManager };