const {HMIPWSGroup} = require('./hmip-ws-group');

/**
 * META group
 */
class HMIPWSMetaGroup extends HMIPWSGroup {
    constructor(params) {
        super({
            id: params.id,
            homeId: params.homeId,
            metaGroupId: params.metaGroupId,
            label: params.label,
            lastStatusUpdate: params.lastStatusUpdate,
            type: "META",
            unreach: params.unreach,
            lowBat: params.lowBat,
            dutyCycle: params.dutyCycle,
            channels: params.channels,
            sabotage: params.sabotage
        });


        this.groups = params.groups;
        this.configPending = params.configPending;
        this.incorrectPositioned = params.incorrectPositioned;
        this.groupIcon = params.groupIcon;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSMetaGroup}
     */
    static fromJson(json) {
        return new HMIPWSMetaGroup({
            id: json.id,
            homeId: json.homeId,
            metaGroupId: json.metaGroupId,
            label: json.label,
            lastStatusUpdate: json.lastStatusUpdate,
            unreach: json.unreach,
            lowBat: json.lowBat,
            dutyCycle: json.dutyCycle,
            channels: json.channels,
            groups: json.groups,
            configPending: json.configPending,
            sabotage: json.sabotage,
            incorrectPositioned: json.incorrectPositioned,
            groupIcon: json.groupIcon
        });
    }
}

module.exports = {HMIPWSMetaGroup}
