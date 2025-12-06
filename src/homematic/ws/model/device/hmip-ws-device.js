const {HMIPWSFunctionalChannel} = require('./channel/hmip-ws-functional-channel');

const {HMIPWSHeatingThermostatDevice} = require('./hmip-ws-device-heating-thermostat');
const {createFunctionalChannelFromJson} = require("./channel/hmip-ws-functional-channel-factory");

/**
 * Base class for devices
 */
class HMIPWSDevice {
    /**
     * @param {string} id
     * @param {string} type
     * @param {string} homeId
     * @param {number} lastStatusUpdate
     * @param {string} label
     * @param {HMIPWSFunctionalChannel[]} functionalChannels
     */
    constructor(id, type, homeId, lastStatusUpdate, label, functionalChannels) {
        this.id = id;
        this.type = type;
        this.homeId = homeId;
        this.lastStatusUpdate = lastStatusUpdate;
        this.label = label;
        this.functionalChannels = functionalChannels;
    }

    /**
     * Device factory (switches based on device.type)
     * @param {any} json
     * @returns {HMIPWSDevice}
     */
    static fromJson(json) {
        if (!json) {
            throw new Error('HMIPWSDevice.fromJson: device json missing');
        }

        const {type} = json;

        // Map of index->channel => array of channels
        const functionalChannelsObj = json.functionalChannels || {};
        const functionalChannels = Object.values(functionalChannelsObj).map(fc =>
            createFunctionalChannelFromJson(fc)
        );

        switch (type) {
            case 'HEATING_THERMOSTAT':
                return HMIPWSHeatingThermostatDevice.fromJson({...json, functionalChannels});

            // add new device types here later;
            // for now we explicitly fail on unknown types:
            default:
                console.error('Unknown HMIPWSDevice.type', type, json);
                throw new Error(`Unsupported HMIPWSDevice type: ${type}`);
        }
    }
}

module.exports = {HMIPWSDevice}
