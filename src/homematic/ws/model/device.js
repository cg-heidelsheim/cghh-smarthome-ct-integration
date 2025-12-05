import HMIPWSHeatingThermostatChannel from "./heating_thermostat_channel";

/**
 * Represents a Homematic IP Device
 */
class HMIPWSDevice {
    /**
     * @param {Object} raw
     */
    constructor(raw = {}) {
        // Copy all flat properties
        Object.assign(this, raw);

        /** @type {HMIPWSHeatingThermostatChannel[]} */
        this.functionalChannels = [];

        if (raw.functionalChannels) {
            for (const [, channel] of Object.entries(raw.functionalChannels)) {
                if (channel.functionalChannelType === "HEATING_THERMOSTAT_CHANNEL") {
                    this.functionalChannels.push(
                        HMIPWSHeatingThermostatChannel.from(channel)
                    );
                }
            }
        }
    }

    static from(rawJson) {
        return new HMIPWSDevice(rawJson);
    }
}

export default HMIPWSDevice;