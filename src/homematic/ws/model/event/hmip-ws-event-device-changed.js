const {HMIPWSDevice} = require('../device/hmip-ws-device');
const {HMIPWSEvent} = require('./hmip-ws-event');
const createDeviceFromJson = require("../device/hmip-ws-device-factory").createDeviceFromJson;

/**
 * DEVICE_CHANGED event
 */
class HMIPWSDeviceChangedEvent extends HMIPWSEvent {
    /**
     * @param {HMIPWSDevice} device
     */
    constructor(device) {
        super('DEVICE_CHANGED');
        this.device = device;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSDeviceChangedEvent}
     */
    static fromJson(json) {
        const device = createDeviceFromJson(json.device);
        return new HMIPWSDeviceChangedEvent(device);
    }
}

module.exports = {HMIPWSDeviceChangedEvent}
