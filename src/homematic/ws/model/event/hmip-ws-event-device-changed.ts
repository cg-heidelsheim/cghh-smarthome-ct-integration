import {HMIPWSEvent} from './hmip-ws-event';
import {createDeviceFromJson} from '../device/hmip-ws-device-factory';
import type {HMIPWSDevice} from '../device/hmip-ws-device';

/**
 * DEVICE_CHANGED event
 */
export class HMIPWSDeviceChangedEvent extends HMIPWSEvent {
    device: HMIPWSDevice | undefined;

    constructor(device: HMIPWSDevice | undefined) {
        super('DEVICE_CHANGED');
        this.device = device;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSDeviceChangedEvent {
        const device = createDeviceFromJson(json.device);
        return new HMIPWSDeviceChangedEvent(device);
    }
}
