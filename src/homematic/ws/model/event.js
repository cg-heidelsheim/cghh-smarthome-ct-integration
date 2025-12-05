const {HMIPWSHomeChangedEvent} = require("./home_changed_event")
const {HMIPWSDeviceChangedEvent} = require("./device_changed_event");
const {HMIPWSGroupChangedEvent} = require("./group_changed_event");

class HMIPWSEvent {
    /**
     * @param {Object} rawEvent
     */
    constructor(rawEvent) {
        this.rawEvent = rawEvent;
    }

    /**
     * Factory: create the correct subclass for a raw event
     * @param {Object} rawEvent
     * @returns {HMIPWSEvent}
     */
    static create(rawEvent) {
        const type = rawEvent.pushEventType;

        switch (type) {
            case "HOME_CHANGED":
                return new HMIPWSHomeChangedEvent(rawEvent);
            case "DEVICE_CHANGED":
                return new HMIPWSDeviceChangedEvent(rawEvent);
            case "GROUP_CHANGED": // note your spelling
                return new HMIPWSGroupChangedEvent(rawEvent);
        }
    }
}

module.exports = {HMIPWSEvent}