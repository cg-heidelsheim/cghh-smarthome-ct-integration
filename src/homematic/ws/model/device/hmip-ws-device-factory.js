const {createFunctionalChannelFromJson} = require("./channel/hmip-ws-functional-channel-factory");
const {HMIPWSHeatingThermostatDevice} = require("./hmip-ws-device-heating-thermostat");
const {Logger} = require("../../../../util/logger");

/**
 * Device factory (switches based on device.type)
 * @param {any} json
 * @returns {HMIPWSDevice}
 */
function createDeviceFromJson(json) {
    if (!json) {
        throw new Error('createDeviceFromJson: device json missing');
    }

    const {type} = json;

    const functionalChannelsObj = json.functionalChannels || {};
    const functionalChannels = Object.values(functionalChannelsObj).map(fc =>
        createFunctionalChannelFromJson(fc)
    );

    switch (type) {
        case 'HEATING_THERMOSTAT':
            return HMIPWSHeatingThermostatDevice.fromJson({...json, functionalChannels});

        default:
            Logger.error({tags: {module: "WS", function: "FACTORY" }, message: 'Unknown HMIPWSDevice.type: ' + type + " - " + JSON.stringify(json)})
    }
}

module.exports = {createDeviceFromJson};