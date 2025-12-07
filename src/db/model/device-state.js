/**
 * Represents the state of a device with multiple channels.
 * Usually (the thermostats on the "Heizkörper" itself, only has a single channel)
 *
 * Example JSON representation as stored on disk:
 * {
 *   "id": "301...",
 *   "label": "Heizkörperthermostat - ...",
 *   "channels": [
 *     {
 *       "index": 1,
 *       "valvePosition": 0,
 *       "temperature": 16.0,
 *       "setTemperature": 16
 *     }
 *   ]
 * }
 */

const {ChannelState} = require("./channel-state");

class DeviceState {

    /**
     * Unique identifier of the device (from Homematic)
     * @type {string}
     */
    id;

    /**
     * Label describing the device
     * @type {string}
     */
    label;

    /**
     * Array of channel states within the device
     * @type {ChannelState[]}
     */
    channels = [];

    /**
     * Retrieves a ChannelState by its index.
     *
     * @param {number} index The index of the channel to retrieve.
     * @returns {ChannelState | undefined} The channel with the specified index, or undefined if not found.
     */
    getChannelByIndex(index) {
        return this.channels.find(channel => channel.index === index);
    }
}

module.exports = {DeviceState};
