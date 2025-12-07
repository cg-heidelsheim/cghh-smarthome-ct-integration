const {HMIPWSFunctionalChannel} = require('./hmip-ws-functional-channel');

/**
 * WALL_MOUNTED_THERMOSTAT_PRO_CHANNEL
 */
class HMIPWSWallMountedThermostatChannel extends HMIPWSFunctionalChannel {
    constructor(params) {
        super(
            'WALL_MOUNTED_THERMOSTAT_PRO_CHANNEL',
            params.deviceId,
            params.index,
            params.groupIndex,
            params.label,
            params.groups,
            params.supportedOptionalFeatures
        );

        this.channelRole = params.channelRole;
        this.temperatureOffset = params.temperatureOffset;
        this.setPointTemperature = params.setPointTemperature;
        this.actualTemperature = params.actualTemperature;
        this.humidity = params.humidity;
        this.display = params.display;
        this.vaporAmount = params.vaporAmount;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSWallMountedThermostatChannel}
     */
    static fromJson(json) {
        const {
            deviceId,
            index,
            groupIndex,
            channelRole,
            temperatureOffset,
            setPointTemperature,
            actualTemperature,
            humidity,
            display,
            vaporAmount
        } = json;

        return new HMIPWSWallMountedThermostatChannel({
            deviceId,
            index,
            groupIndex,
            channelRole,
            temperatureOffset,
            setPointTemperature,
            actualTemperature,
            humidity,
            display,
            vaporAmount
        });
    }
}

module.exports = {HMIPWSWallMountedThermostatChannel}