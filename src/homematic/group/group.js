/**
 * TODO: find out what fields the HMIP sends for a group on a WebSocket message. Update this class respectively
 */

class Group {

    data;

    constructor(data) {
        this.data = data;
    }

    /**
     * @returns boolean if is of type "HEATING"
     */
    isHeatingGroup() {
        return this.type === "HEATING";
    }
}

module.exports = {Group};