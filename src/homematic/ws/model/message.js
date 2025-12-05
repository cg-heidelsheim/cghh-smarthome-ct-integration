import {HMIPWSEvent} from "./event";
import {HMIPWSOrigin} from "./origin";

class HMIPWSMessage {
    /**
     * Accesspoint ID
     * @type {String}
     */
    accessPointId;

    /**
     * UNIX Timestamp
     * @type {number}
     */
    timestamp;

    /** @type {HMIPWSOrigin} */
    origin;

    /**
     * List of events
     * @type {HMIPWSEvent[]}
     */
    events;

    /**
     * @param {Object<string, any>} rawMessage
     *   e.g. the "events" part of your JSON
     */
    constructor(rawMessage = {}) {
        // store as a Map for easier access by id
        this.accessPointId = rawMessage.accessPointId;
        this.origin = new HMIPWSOrigin(rawMessage.origin);
        this.timestamp = rawMessage.timestamp;

        this.events = [];

        for (const [id, eventData] of Object.entries(rawMessage.events)) {
            this.events.push(new HMIPWSEvent(eventData));
        }
    }
}

module.exports = {HMIPWSMessage}