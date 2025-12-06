const {HMIPWSGroupChannelRef} = require("./hmip-ws-group-channel-ref");
const {HMIPWSHeatingGroup} = require("./hmip-ws-group-heating");
const {HMIPWSMetaGroup} = require("./hmip-ws-group-meta");
const {HMIPWSIndoorClimateGroup} = require("./hmip-ws-group-indoor-climate");

/**
 * Factory function to create HMIPWSFunctionalChannel instance from JSON.
 * Implements CommonJS synchronous style.
 *
 * @param {any} json
 * @returns {HMIPWSGroup}
 */
function createGroupFromJson(json) {
    if (!json) {
        throw new Error('createGroupFromJson: group json missing');
    }

    json.channels = (json.channels || []).map(c =>
        HMIPWSGroupChannelRef.fromJson(c)
    );

    const type = json.type;

    switch (type) {
        case 'HEATING':
            return HMIPWSHeatingGroup.fromJson(json);
        case 'META':
            return HMIPWSMetaGroup.fromJson(json);
        case 'INDOOR_CLIMATE':
            return HMIPWSIndoorClimateGroup.fromJson(json);
        default:
            console.error('Unknown HMIPWSGroup.type', type, json);
            throw new Error(`Unsupported HMIPWSGroup type: ${type}`);
    }
}

module.exports = {createGroupFromJson}
