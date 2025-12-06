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
}

module.exports = {HMIPWSEvent}
