class HMIPWSFunctionalChannel {
    /**
     * @param {string} functionalChannelType
     * @param {string} deviceId
     * @param {number} index
     * @param {number|null} groupIndex
     */
    constructor(functionalChannelType, deviceId, index, groupIndex) {
        this.functionalChannelType = functionalChannelType;
        this.deviceId = deviceId;
        this.index = index;
        this.groupIndex = groupIndex;
    }
}

module.exports = {HMIPWSFunctionalChannel};
