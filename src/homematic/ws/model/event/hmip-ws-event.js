const {HMIPWSDeviceChangedEvent} = require('./hmip-ws-event-device-changed');
const {HMIPWSGroupChangedEvent} = require('./hmip-ws-event-group-changed');
const {HMIPWSHomeChangedEvent} = require('./hmip-ws-event-home-changed');

/**
 * Base class for all events
 */
class HMIPWSEvent {
    /**
     * @param {HMIPWSPushEventType} pushEventType
     */
    constructor(pushEventType) {
        this.pushEventType = pushEventType;
    }

    /**
     * Factory: detect correct concrete event class.
     * @param {any} json
     * @returns {HMIPWSEvent}
     */
    static fromJson(json) {
        if (!json || typeof json !== 'object') {
            throw new Error('HMIPWSEvent.fromJson: invalid event json');
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
                console.error('Unknown HMIPWSEvent.pushEventType', type, json);
                throw new Error(`Unsupported HMIPWSEvent type: ${type}`);
        }
    }
}

module.exports = {HMIPWSEvent}
