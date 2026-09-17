import {createFunctionalChannelFromJson} from './channel/hmip-ws-functional-channel-factory';
import {HMIPWSHeatingThermostatDevice} from './hmip-ws-device-heating-thermostat';
import {Logger} from '../../../../util/logger';
import type {HMIPWSDevice} from './hmip-ws-device';

require('dotenv').config();

/**
 * Device factory (switches based on device.type)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
export function createDeviceFromJson(json: Record<string, any>): HMIPWSDevice | undefined {
    if (!json) {
        throw new Error('createDeviceFromJson: device json missing');
    }

    const {type} = json;

    const functionalChannelsObj = json.functionalChannels || {};
    const functionalChannels = Object.values(functionalChannelsObj).map((fc) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
        createFunctionalChannelFromJson(fc as Record<string, any>)
    );

    switch (type) {
        case 'HEATING_THERMOSTAT':
            return HMIPWSHeatingThermostatDevice.fromJson({...json, functionalChannels});

        default: {
            if (process.env.ENVIRONMENT !== 'production') {
                const ignores = ['BLIND', 'SHUTTER', 'ACCESS_POINT', 'WALL_MOUNTED_THERMOSTAT_PRO'];
                const matches = ignores.some(t => type.includes(t));

                if (matches) {
                    Logger.warn({
                        tags: {module: 'WS', function: 'FACTORY'},
                        message: 'Unknown HMIPWSDevice.type: ' + type
                    });
                } else {
                    Logger.warn({
                        tags: {module: 'WS', function: 'FACTORY'},
                        message: 'Unknown HMIPWSDevice.type: ' + type + ' - ' + JSON.stringify(json)
                    });
                }
            }
            return undefined;
        }
    }
}
