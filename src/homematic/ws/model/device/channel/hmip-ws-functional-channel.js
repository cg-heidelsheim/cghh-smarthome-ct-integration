const {HMIPWSDeviceOperationLockChannel} = require('./hmip-ws-functional-channel-operation-lock');
const {HMIPWSHeatingThermostatChannel} = require('./hmip-ws-functional-channel-heating-thermostat');

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

    /**
     * @param {any} json
     * @returns {HMIPWSFunctionalChannel}
     */
    static fromJson(json) {
        if (!json) {
            throw new Error('HMIPWSFunctionalChannel.fromJson: missing json');
        }

        const type = json.functionalChannelType;

        switch (type) {
            case 'DEVICE_OPERATIONLOCK':
                return HMIPWSDeviceOperationLockChannel.fromJson(json);
            case 'HEATING_THERMOSTAT_CHANNEL':
                return HMIPWSHeatingThermostatChannel.fromJson(json);

            default:
                console.error(
                    'Unknown HMIPWSFunctionalChannel.functionalChannelType',
                    type,
                    json
                );
                throw new Error(
                    `Unsupported HMIPWSFunctionalChannel type: ${type}`
                );
        }
    }
}

module.exports = {HMIPWSFunctionalChannel}
