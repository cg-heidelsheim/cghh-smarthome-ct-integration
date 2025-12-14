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

        default: {
            const ignores = ["BLIND", "SHUTTER", "ACCESS_POINT", "WALL_MOUNTED_THERMOSTAT_PRO"];
            const matches = ignores.some(t => type.includes(t));

            if (matches) {
                Logger.warn({tags: {module: "WS", function: "FACTORY"}, message: 'Unknown HMIPWSDevice.type: ' + type})
            } else {
                Logger.warn({
                    tags: {module: "WS", function: "FACTORY"},
                    message: 'Unknown HMIPWSDevice.type: ' + type + " - " + JSON.stringify(json)
                })
            }
        }
    }
}

module.exports = {createDeviceFromJson};