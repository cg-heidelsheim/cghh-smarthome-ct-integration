const {HMIPWSEvent} = require('./hmip-ws-event');
const {createGroupFromJson} = require('../group/hmip-ws-group-factory');

/**
 * GROUP_CHANGED event
 */
class HMIPWSGroupChangedEvent extends HMIPWSEvent {
    /**
     * @param {import('../group/hmip-ws-group').HMIPWSGroup} group
     */
    constructor(group) {
        super('GROUP_CHANGED');
        this.group = group;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSGroupChangedEvent}
     */
    static fromJson(json) {
        const group = createGroupFromJson(json.group);
        return new HMIPWSGroupChangedEvent(group);
    }
}

module.exports = {HMIPWSGroupChangedEvent};
