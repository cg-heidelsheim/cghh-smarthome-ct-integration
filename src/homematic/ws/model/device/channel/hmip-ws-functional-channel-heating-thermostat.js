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
            params.groupIndex
        );

        this.label = params.label;
        this.groups = params.groups;
        this.channelRole = params.channelRole;
        this.supportedOptionalFeatures = params.supportedOptionalFeatures;
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
            label,
            deviceId,
            index,
            groupIndex,
            groups,
            channelRole,
            supportedOptionalFeatures,
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
            label,
            deviceId,
            index,
            groupIndex,
            groups,
            channelRole,
            supportedOptionalFeatures,
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