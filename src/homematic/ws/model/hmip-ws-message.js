/**
 * Top-level WebSocket message for Homematic IP
 * This models the full JSON you posted.
 */

const {HMIPWSEvent} = require('./event/hmip-ws-event');
const {HMIPWSOrigin} = require('./hmip-ws-origin');

/**
 * @typedef {'DEVICE' | 'GROUP' | 'HOME'} HMIPWSOriginType
 */

/**
 * @typedef {'DEVICE_CHANGED' | 'GROUP_CHANGED' | 'HOME_CHANGED'} HMIPWSPushEventType
 */

class HMIPWSMessage {
    /**
     * @param {HMIPWSEvent[]} events
     * @param {HMIPWSOrigin} origin
     * @param {string} accessPointId
     * @param {number} timestamp
     */
    constructor(events, origin, accessPointId, timestamp) {
        this.events = events;
        this.origin = origin;
        this.accessPointId = accessPointId;
        this.timestamp = timestamp;
    }

    /**
     * Convert raw WS JSON into typed message.
     * @param {any} json
     * @returns {HMIPWSMessage}
     */
    static fromJson(json) {
        if (!json || typeof json !== 'object') {
            throw new Error('HMIPWSMessage.fromJson: invalid json');
        }

        const eventsObject = json.events || {};
        const events = Object.values(eventsObject).map(evJson =>
            HMIPWSEvent.fromJson(evJson)
        );

        const origin = HMIPWSOrigin.fromJson(json.origin);

        return new HMIPWSMessage(
            events,
            origin,
            json.accessPointId,
            json.timestamp
        );
    }
}

module.exports = {HMIPWSMessage, HMIPWSPushEventType, HMIPWSOriginType}
