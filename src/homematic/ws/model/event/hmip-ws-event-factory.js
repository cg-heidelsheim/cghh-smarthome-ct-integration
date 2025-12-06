const {HMIPWSDeviceChangedEvent} = require("./hmip-ws-event-device-changed");
const {HMIPWSGroupChangedEvent} = require("./hmip-ws-event-group-changed");
const {HMIPWSHomeChangedEvent} = require("./hmip-ws-event-home-changed");

/**
 * Factory function to create HMIPWSEvent instance from JSON.
 * Implements CommonJS synchronous style.
 *
 * @param {any} json
 * @returns {HMIPWSEvent}
 */
function createEventFromJson(json) {
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
            console.error('Unknown HMIPWSEvent.pushEventType', type, json);
            throw new Error(`Unsupported HMIPWSEvent type: ${type}`);
    }

}

module.exports = {createEventFromJson};
