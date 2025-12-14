/**
 * Small helper for group channel references
 */
class HMIPWSGroupChannelRef {
    /**
     * @param {string} deviceId
     * @param {number} channelIndex
     */
    constructor(deviceId, channelIndex) {
        this.deviceId = deviceId;
        this.channelIndex = channelIndex;
    }

    /**
     * @param {any} json
     */
    static fromJson(json) {
        return new HMIPWSGroupChannelRef(json.deviceId, json.channelIndex);
    }
}

module.exports = {HMIPWSGroupChannelRef}
