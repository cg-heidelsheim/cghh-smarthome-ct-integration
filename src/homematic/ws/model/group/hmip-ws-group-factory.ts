import {HMIPWSGroupChannelRef} from './hmip-ws-group-channel-ref';
import {HMIPWSHeatingGroup} from './hmip-ws-group-heating';
import {HMIPWSMetaGroup} from './hmip-ws-group-meta';
import {HMIPWSIndoorClimateGroup} from './hmip-ws-group-indoor-climate';
import {Logger} from '../../../../util/logger';
import type {HMIPWSGroup} from './hmip-ws-group';

require('dotenv').config();

/**
 * Factory function to create HMIPWSFunctionalChannel instance from JSON.
 * Implements CommonJS synchronous style.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
export function createGroupFromJson(json: Record<string, any>): HMIPWSGroup | undefined {
    if (!json) {
        throw new Error('createGroupFromJson: group json missing');
    }

    json.channels = (json.channels || []).map((
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
        c: Record<string, any>
    ) => HMIPWSGroupChannelRef.fromJson(c));

    const type = json.type;

    switch (type) {
        case 'HEATING':
            return HMIPWSHeatingGroup.fromJson(json);
        case 'META':
            return HMIPWSMetaGroup.fromJson(json);
        case 'INDOOR_CLIMATE':
            return HMIPWSIndoorClimateGroup.fromJson(json);
        default: {
            if (process.env.ENVIRONMENT !== 'production') {
                const ignores = ['SHUTTER'];
                const matches = ignores.some(t => type.includes(t));

                if (matches) {
                    Logger.warn({
                        tags: {module: 'WS', function: 'FACTORY'},
                        message: 'IGNORE HMIPWSGroup.type: ' + type
                    });
                } else {
                    Logger.warn({
                        tags: {module: 'WS', function: 'FACTORY'},
                        message: 'Unknown HMIPWSGroup.type: ' + type + ' - ' + JSON.stringify(json)
                    });
                }
            }
            return undefined;
        }
    }
}
