const {GroupState} = require("../../db/model/group-state");
const {Group} = require("./group");

class GroupStateBuilder {

    /**
     * Transform a HMIP group object into a group state object for DB storage.
     *
     * @param {HMIPWSHeatingGroup} group Group object from HMIP
     * @returns {GroupState}
     */
    static fromHomematicGroup(group) {
        const groupState = new GroupState();

        groupState.id = group.id;
        groupState.label = group.label;
        groupState.temperature = group.actualTemperature;
        groupState.setTemperature = group.setPointTemperature;
        groupState.humidity = group.humidity;

        return groupState;
    }

    /**
     * Built a dummy object, representing a placeholder for the first save.
     * Contains a label with the value "INIT" that can later be checked for different logging and processing
     *
     * @param {string} id HMIP group id
     * @returns {GroupState}
     */
    static dummyState(id) {
        const groupState = new GroupState();

        groupState.id = id;
        groupState.label = "INIT";

        return groupState;
    }
}

module.exports = {GroupStateBuilder};
