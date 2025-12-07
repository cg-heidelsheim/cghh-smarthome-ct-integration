const HMIPWSDeviceOperationLockChannel = require('./hmip-ws-functional-channel-operation-lock').HMIPWSDeviceOperationLockChannel;
const HMIPWSHeatingThermostatChannel = require('./hmip-ws-functional-channel-heating-thermostat').HMIPWSHeatingThermostatChannel;

/**
 * Factory function to create HMIPWSFunctionalChannel instance from JSON.
 * Implements CommonJS synchronous style.
 *
 * @param {any} json
 * @returns {HMIPWSFunctionalChannel}
 */
function createFunctionalChannelFromJson(json) {
    if (!json) {
        throw new Error('createFunctionalChannelFromJson: missing json');
    }

    const type = json.functionalChannelType;

    switch (type) {
        case 'DEVICE_OPERATIONLOCK':
            return HMIPWSDeviceOperationLockChannel.fromJson(json);
        case 'HEATING_THERMOSTAT_CHANNEL':
            return HMIPWSHeatingThermostatChannel.fromJson(json);
        case 'WALL_MOUNTED_THERMOSTAT_PRO_CHANNEL':
            return HMIPWSWallMountedThermostatChannel.fromJSON(json);
        default:
            console.error('Unknown HMIPWSFunctionalChannel.functionalChannelType', type, json);
            throw new Error(`Unsupported HMIPWSFunctionalChannel type: ${type}`);
    }
}

module.exports = { createFunctionalChannelFromJson };
