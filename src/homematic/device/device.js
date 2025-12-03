/**
 * TODO: find out what fields the HMIP sends for a device on a WebSocket message. Update this class respectively
 */
class Device {

    data;

    constructor(data) {
        this.data = data;
    }

    /**
     * @returns boolean if is of type "HEATING"
     */
    isHeatingThermostat() {
        return this.data.type === "HEATING_THERMOSTAT";
    }

    getRelevantFunctionalChannels() {
        const functionalChannels = this.data.functionalChannels;
        const functionalChannelKeys = Object.keys(functionalChannels);

        const channels = [];

        for (const channelKey of functionalChannelKeys) {
            const channel = functionalChannels[channelKey];

            if (channel.functionalChannelType !== "HEATING_THERMOSTAT_CHANNEL") continue;

            channels.push(channel);
        }

        return channels;
    }
}

module.exports = { Device };