/**
 * Represents the state of a channel in a {@link Device}.
 */
class ChannelState {
    /**
     * Index of the channel.
     * @type {number}
     */
    index;

    /**
     * Position of the valve.
     * @type {number}
     */
    valvePosition;

    /**
     * Current temperature in the channel.
     * @type {number}
     */
    temperature;

    /**
     * Set temperature for the channel.
     * @type {number}
     */
    setTemperature;

    /**
     * Compares this channel state with another channel state.
     * 
     * @param {ChannelState} other
     * @returns {boolean} true if all compared attributes are equal, false otherwise
     */
    equalsValueAttributes(other) {
        if (!other) return false;
        return this.temperature === other.temperature &&
               this.setTemperature === other.setTemperature &&
               this.valvePosition === other.valvePosition
    }
}

module.exports = { ChannelState };
