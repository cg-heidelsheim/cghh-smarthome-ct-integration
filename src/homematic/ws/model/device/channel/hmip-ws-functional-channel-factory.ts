import {HMIPWSWallMountedThermostatChannel} from './hmip-ws-functional-channel-wall-mounted-thermostat';
import {HMIPWSAccessControllerWiredChannel} from './hmip-ws-functional-channel-access-controller-wired';
import {Logger} from '../../../../../util/logger';
import {HMIPWSDeviceOperationLockChannel} from './hmip-ws-functional-channel-operation-lock';
import {HMIPWSHeatingThermostatChannel} from './hmip-ws-functional-channel-heating-thermostat';
import type {HMIPWSFunctionalChannel} from './hmip-ws-functional-channel';

require('dotenv').config();

/**
 * Factory function to create HMIPWSFunctionalChannel instance from JSON.
 * Implements CommonJS synchronous style.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
export function createFunctionalChannelFromJson(json: Record<string, any>): HMIPWSFunctionalChannel | undefined {
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
            if (process.env.ENVIRONMENT !== 'production') {
                const ignores = [
                    'BLIND', // Rolladen
                    'MULTI_MODE_INPUT_CHANNEL', // Multi Input for e.g. Rolladen,
                    'FLOOR_TERMINAL_BLOCK_MECHANIC_CHANNEL', // IDK - eig der Actuator im Heizungsraum?
                    'SINGLE_KEY_CHANNEL' // no infos?
                ];

                const matches = ignores.some(t => type.includes(t));

                if (matches) {
                    Logger.warn({
                        tags: {module: 'WS', function: 'FACTORY'},
                        message: 'IGNORE HMIPWSFunctionalChannel.functionalChannelType: ' + type
                    });
                } else {
                    Logger.warn({
                        tags: {module: 'WS', function: 'FACTORY'},
                        message: 'Unknown HMIPWSFunctionalChannel.functionalChannelType: ' + type + ' - ' + JSON.stringify(json)
                    });
                }
            }
            return undefined;
        }
    }
}
