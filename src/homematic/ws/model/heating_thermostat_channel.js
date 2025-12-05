/**
 * Represents a Heating Thermostat Channel from a Homematic IP device
 */
class HMIPWSHeatingThermostatChannel {
    /**
     * @param {Object} raw
     * @param {string} raw.label
     * @param {string} raw.deviceId
     * @param {number} raw.index
     * @param {number} raw.groupIndex
     * @param {string} raw.functionalChannelType
     * @param {string[]} raw.groups
     * @param {number} raw.temperatureOffset
     * @param {number} raw.valvePosition
     * @param {number} raw.setPointTemperature
     * @param {string} raw.valveState
     * @param {number} raw.valveActualTemperature
     */
    constructor(raw = {}) {
        // shallow copy of all raw properties
        Object.assign(this, raw);
    }

    static from(raw) {
        return new HMIPWSHeatingThermostatChannel(raw);
    }
}

export default HMIPWSHeatingThermostatChannel;