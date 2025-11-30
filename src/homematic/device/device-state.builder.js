const { DeviceState } = require("./device-state");
const { Device } = require("./device");

const {ChannelState} = require("./channel-state");

const fs = require("fs");

const FILE_NAME = process.cwd() + "/persistent/states/devices.json";

class DeviceStateBuilder {
    constructor() {

    }

    deviceStateFromFile(deviceId) {
        var dataRaw;

        try {
            dataRaw = fs.readFileSync(FILE_NAME, 'utf8');
        } catch (e) {
            dataRaw = "{}";
        }

        const json_data = JSON.parse(dataRaw);

        const deviceStateRaw = json_data[deviceId];

        if (!deviceStateRaw) {
            return this.buildInitDeviceState();
        }

        const deviceState = new DeviceState();
        Object.assign(deviceState, deviceStateRaw);

        return deviceState;
    }

    /**
     * 
     * @param {Device} device 
     * @returns 
     */
    deviceStateFromHomematicDevice(device) {
        const deviceState = new DeviceState();

        deviceState.id = device.data.id;
        deviceState.label = device.data.label;

        /**
         * @type {ChannelState[]}
         */
        const channels = [];

        device
            .getRelevantFunctionalChannels()
            .forEach(
                (channel) => {
                    const outputChannel = new ChannelState();
                    outputChannel.index = channel.index;
                    outputChannel.valvePosition = channel.valvePosition;
                    outputChannel.temperature = channel.valveActualTemperature;
                    outputChannel.setTemperature = channel.setPointTemperature;

                    channels.push(outputChannel);
                }
            );

        deviceState.channels = channels;

        return deviceState;
    }

    /**
     * @param {DeviceState} state 
     */
    deviceStateFromDeviceState(state) {
        return JSON.parse(JSON.stringify(state));
    }

    buildInitDeviceState() {
        const deviceState = new DeviceState();

        deviceState.label = "INIT";
        deviceState.channels = [];

        return deviceState;
    }
}

module.exports = { DeviceStateBuilder };
