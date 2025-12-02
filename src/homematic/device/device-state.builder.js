const {ChannelState} = require("./channel-state");
const {DeviceState} = require("./device-state");
const {Device} = require("./device");

class DeviceStateBuilder {

    /**
     * Transform a HMIP device object into a device state object for DB storage.
     *
     * @param {Device} device Device object from HMIP
     * @returns {DeviceState}
     */
    static fromHomematicDevice(device) {
        const deviceState = new DeviceState();

        deviceState.id = device.data.id;
        deviceState.label = device.data.label;
        deviceState.channels = device.getRelevantFunctionalChannels()
            .map(channel => {
                const outputChannel = new ChannelState();
                outputChannel.index = channel.index;
                outputChannel.valvePosition = channel.valvePosition;
                outputChannel.temperature = channel.valveActualTemperature;
                outputChannel.setTemperature = channel.setPointTemperature;
                return outputChannel;
            });

        return deviceState;
    }

    /**
     * Built a dummy object, representing a placeholder for the first save.
     * Contains a label with the value "INIT" that can later be checked for different logging and processing
     *
     * @param {string} id HMIP device id
     * @returns {DeviceState}
     */
    static dummyState(id) {
        const deviceState = new DeviceState();

        deviceState.id = id;
        deviceState.label = "INIT";
        deviceState.channels = [];

        return deviceState;
    }
}

module.exports = {DeviceStateBuilder};
