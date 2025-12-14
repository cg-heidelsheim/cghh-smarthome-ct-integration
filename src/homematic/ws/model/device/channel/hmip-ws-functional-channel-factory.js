const {HMIPWSWallMountedThermostatChannel} = require("./hmip-ws-functional-channel-wall-mounted-thermostat");
const {HMIPWSAccessControllerWiredChannel} = require("./hmip-ws-functional-channel-access-controller-wired");
const {Logger} = require("../../../../../util/logger");
const HMIPWSDeviceOperationLockChannel = require('./hmip-ws-functional-channel-operation-lock').HMIPWSDeviceOperationLockChannel;
const HMIPWSHeatingThermostatChannel = require('./hmip-ws-functional-channel-heating-thermostat').HMIPWSHeatingThermostatChannel;

require('dotenv').config();

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
            return HMIPWSWallMountedThermostatChannel.fromJson(json);
        case 'ACCESS_CONTROLLER_WIRED_CHANNEL':
            return HMIPWSAccessControllerWiredChannel.fromJson(json);
        default: {
            if (process.env.ENVIRONMENT !== "production") {
                const ignores = [
                    "BLIND", // Rolladen
                    "MULTI_MODE_INPUT_CHANNEL", // Multi Input for e.g. Rolladen,
                    "FLOOR_TERMINAL_BLOCK_MECHANIC_CHANNEL", // IDK - eig der Actuator im Heizungsraum?
                    "SINGLE_KEY_CHANNEL" // no infos?
                ];

                const matches = ignores.some(t => type.includes(t));

                if (matches) {
                    Logger.warn({
                        tags: {module: "WS", function: "FACTORY"},
                        message: 'IGNORE HMIPWSFunctionalChannel.functionalChannelType: ' + type
                    });
                } else {
                    Logger.warn({
                        tags: {module: "WS", function: "FACTORY"},
                        message: 'Unknown HMIPWSFunctionalChannel.functionalChannelType: ' + type + " - " + JSON.stringify(json)
                    });
                }
            }
        }
    }
}

module.exports = {createFunctionalChannelFromJson};
