class HMIPWSFunctionalChannel {
    /**
     * @param {string} functionalChannelType
     * @param {string} deviceId
     * @param {number} index
     * @param {number} groupIndex
     * @param {string} label
     * @param {string[]} groups
     * @param {Object} supportedOptionalFeatures
     */
    constructor(functionalChannelType, deviceId, index, groupIndex, label, groups, supportedOptionalFeatures) {
        this.functionalChannelType = functionalChannelType;
        this.deviceId = deviceId;
        this.index = index;
        this.groupIndex = groupIndex;
        this.label = label;
        this.groups = groups;
        this.supportedOptionalFeatures = supportedOptionalFeatures;
    }
}

module.exports = {HMIPWSFunctionalChannel};
