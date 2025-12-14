const {HMIPWSFunctionalChannel} = require('./hmip-ws-functional-channel');

/**
 * HEATING_THERMOSTAT_CHANNEL
 */
class HMIPWSHeatingThermostatChannel extends HMIPWSFunctionalChannel {
    constructor(params) {
        super(
            'HEATING_THERMOSTAT_CHANNEL',
            params.deviceId,
            params.index,
            params.groupIndex,
            params.label,
            params.groups,
            params.supportedOptionalFeatures
        );

        this.channelRole = params.channelRole;
        this.temperatureOffset = params.temperatureOffset;
        this.valvePosition = params.valvePosition;
        this.setPointTemperature = params.setPointTemperature;
        this.valveState = params.valveState;
        this.valveActualTemperature = params.valveActualTemperature;

        // explicitly mapped extra fields from JSON:
        this.boostSignalHue = params.boostSignalHue;
        this.boostSignalSaturation = params.boostSignalSaturation;
        this.boostSignalLevel = params.boostSignalLevel;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSHeatingThermostatChannel}
     */
    static fromJson(json) {
        const {
            deviceId,
            index,
            groupIndex,
            channelRole,
            temperatureOffset,
            valvePosition,
            setPointTemperature,
            valveState,
            valveActualTemperature,
            boostSignalHue,
            boostSignalSaturation,
            boostSignalLevel
        } = json;

        return new HMIPWSHeatingThermostatChannel({
            deviceId,
            index,
            groupIndex,
            channelRole,
            temperatureOffset,
            valvePosition,
            setPointTemperature,
            valveState,
            valveActualTemperature,
            boostSignalHue,
            boostSignalSaturation,
            boostSignalLevel
        });
    }
}

module.exports = {HMIPWSHeatingThermostatChannel}