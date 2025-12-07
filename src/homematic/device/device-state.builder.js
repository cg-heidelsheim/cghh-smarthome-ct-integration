const {ChannelState} = require("../../db/model/channel-state");
const {DeviceState} = require("../../db/model/device-state");
const {HMIPWSHeatingThermostatChannel} = require("../ws/model/device/channel/hmip-ws-functional-channel-heating-thermostat");

class DeviceStateBuilder {

    /**
     * Transform a HMIP device object into a device state object for DB storage.
     *
     * @param {HMIPWSHeatingThermostatDevice} device Device object from HMIP
     * @returns {DeviceState}
     */
    static fromHomematicDevice(device) {
        const deviceState = new DeviceState();

        deviceState.id = device.id;
        deviceState.label = device.label;
        deviceState.channels = (device.functionalChannels || [])
            .filter(ch => ch instanceof HMIPWSHeatingThermostatChannel)
            .map(ch => {
                const outputChannel = new ChannelState();
                outputChannel.index = ch.index;
                outputChannel.valvePosition = ch.valvePosition;
                outputChannel.temperature = ch.valveActualTemperature;
                outputChannel.setTemperature = ch.setPointTemperature;
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
