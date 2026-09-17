import {HMIPWSDeviceChangedEvent} from './hmip-ws-event-device-changed';
import {HMIPWSGroupChangedEvent} from './hmip-ws-event-group-changed';
import {HMIPWSHomeChangedEvent} from './hmip-ws-event-home-changed';
import {Logger} from '../../../../util/logger';
import type {HMIPWSEvent} from './hmip-ws-event';

require('dotenv').config();

/**
 * Factory function to create HMIPWSEvent instance from JSON.
 * Implements CommonJS synchronous style.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
export function createEventFromJson(json: Record<string, any>): HMIPWSEvent | undefined {
    if (!json || typeof json !== 'object') {
        throw new Error('createEventFromJson: invalid event json');
    }

    const type = json.pushEventType;

    switch (type) {
        case 'DEVICE_CHANGED':
            return HMIPWSDeviceChangedEvent.fromJson(json);
        case 'GROUP_CHANGED':
            return HMIPWSGroupChangedEvent.fromJson(json);
        case 'HOME_CHANGED':
            return HMIPWSHomeChangedEvent.fromJson(json);
        default:
            if (process.env.ENVIRONMENT === 'production') {
                Logger.warn({
                    tags: {module: 'WS', function: 'FACTORY'},
                    message: 'Unknown HMIPWSEvent.pushEventType: ' + type + ' - ' + JSON.stringify(json)
                });
            }
            return undefined;
    }
}
