const {DataSender} = require("./data-sender.base");
const {ChanelState} = require("../db/model/channel-state");
const {parseDeviceStateChannelIntoInfluxDataObject} = require("../util/homematic-influx.mapper");

/**
 * Device data sender class.
 * Sends parsed device channel information to InfluxDB.
 */
class DeviceDataSender extends DataSender {

    constructor() {
        super("devices");
    }

    /**
     * @param args
     * @param {GroupState}      args[0] state
     * @param {number}          args[1] channelIndex
     */
    parseData(...args) {
        const [state, channelIndex] = args;

        /** @type {ChanelState} */
        const channel = state.channels.find(channel => channel.index === channelIndex);
        if (!channel) {
            throw new Error(`Channel with index ${channelIndex} not found in updatedState.`);
        }

        return parseDeviceStateChannelIntoInfluxDataObject(state, channel);
    }
}

module.exports = {DeviceDataSender};
