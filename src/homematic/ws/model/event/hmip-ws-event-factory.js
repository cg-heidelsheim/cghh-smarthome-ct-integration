const {HMIPWSDeviceChangedEvent} = require("./hmip-ws-event-device-changed");
const {HMIPWSGroupChangedEvent} = require("./hmip-ws-event-group-changed");
const {HMIPWSHomeChangedEvent} = require("./hmip-ws-event-home-changed");
const {Logger} = require("../../../../util/logger");

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
            Logger.error({tags: {module: "WS", function: "FACTORY" }, message: 'Unknown HMIPWSEvent.pushEventType: ' + type + " - " + json})
    }

}

module.exports = {createEventFromJson};
