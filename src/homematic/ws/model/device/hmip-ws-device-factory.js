const {createFunctionalChannelFromJson} = require("./channel/hmip-ws-functional-channel-factory");
const {HMIPWSHeatingThermostatDevice} = require("./hmip-ws-device-heating-thermostat");

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
            console.error('Unknown HMIPWSDevice.type', type, json);
            throw new Error(`Unsupported HMIPWSDevice type: ${type}`);
    }
}

module.exports = {createDeviceFromJson};