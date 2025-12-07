const {HMIPWSWallMountedThermostatChannel} = require("./hmip-ws-functional-channel-wall-mounted-thermostat");
const {HMIPWSAccessControllerWiredChannel} = require("./hmip-ws-functional-channel-access-controller-wired");
const {Logger} = require("../../../../../util/logger");
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
        case 'ACCESS_CONTROLLER_WIRED_CHANNEL':
            return HMIPWSAccessControllerWiredChannel.fromJSON(json);
        default:
            Logger.error({tags: {module: "WS", function: "FACTORY" }, message: 'Unknown HMIPWSFunctionalChannel.functionalChannelType: ' + type}, {json: json});
    }
}

module.exports = { createFunctionalChannelFromJson };
