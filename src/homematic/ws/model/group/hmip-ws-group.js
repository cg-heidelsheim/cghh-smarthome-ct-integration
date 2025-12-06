const {HMIPWSHeatingGroup} = require('./hmip-ws-group-heating');
const {HMIPWSMetaGroup} = require('./hmip-ws-group-meta');
const {HMIPWSIndoorClimateGroup} = require('./hmip-ws-group-indoor-climate');
const {HMIPWSGroupChannelRef} = require('./hmip-ws-group-channel-ref');

/**
 * Base class for groups
 */
class HMIPWSGroup {
    constructor(params) {
        this.id = params.id;
        this.homeId = params.homeId;
        this.metaGroupId = params.metaGroupId;
        this.label = params.label;
        this.lastStatusUpdate = params.lastStatusUpdate;
        this.type = params.type;
        this.unreach = params.unreach;
        this.lowBat = params.lowBat;
        this.dutyCycle = params.dutyCycle;
        this.channels = params.channels;
        this.sabotage = params.sabotage;
    }

    /**
     * Group factory based on group.type
     * @param {any} json
     * @returns {HMIPWSGroup}
     */
    static fromJson(json) {
        if (!json) {
            throw new Error('HMIPWSGroup.fromJson: group json missing');
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
}

module.exports = {HMIPWSGroup}
