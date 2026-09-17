export type HMIPWSPushEventType = 'DEVICE_CHANGED' | 'GROUP_CHANGED' | 'HOME_CHANGED';

/**
 * Base class for all events
 */
export class HMIPWSEvent {
    pushEventType: HMIPWSPushEventType;

    constructor(pushEventType: HMIPWSPushEventType) {
        this.pushEventType = pushEventType;
    }
}
