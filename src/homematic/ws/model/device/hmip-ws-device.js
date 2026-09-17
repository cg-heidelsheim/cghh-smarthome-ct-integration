/**
 * Base class for devices
 */
class HMIPWSDevice {
// The fromJson static factory was moved to src/homematic/ws/model/device/hmip-ws-device-factory.js to break circular dependency

    /**
     * @param {string} id
     * @param {string} type
     * @param {string} homeId
     * @param {number} lastStatusUpdate
     * @param {string} label
     * @param {import('./channel/hmip-ws-functional-channel').HMIPWSFunctionalChannel[]} functionalChannels
     */
    constructor(id, type, homeId, lastStatusUpdate, label, functionalChannels) {
        this.id = id;
        this.type = type;
        this.homeId = homeId;
        this.lastStatusUpdate = lastStatusUpdate;
        this.label = label;
        this.functionalChannels = functionalChannels;
    }
}

module.exports = {HMIPWSDevice};
