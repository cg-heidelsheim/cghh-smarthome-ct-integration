const {HMIPWSGroup} = require('./hmip-ws-group');

/**
 * INDOOR_CLIMATE group
 */
class HMIPWSIndoorClimateGroup extends HMIPWSGroup {
    constructor(params) {
        super({
            id: params.id,
            homeId: params.homeId,
            metaGroupId: params.metaGroupId,
            label: params.label,
            lastStatusUpdate: params.lastStatusUpdate,
            type: "INDOOR_CLIMATE",
            unreach: params.unreach,
            lowBat: params.lowBat,
            dutyCycle: params.dutyCycle,
            channels: params.channels,
            sabotage: params.sabotage
        });

        this.processing = params.processing;
        this.ventilationState = params.ventilationState;
        this.ventilationLevel = params.ventilationLevel;
        this.windowState = params.windowState;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSIndoorClimateGroup}
     */
    static fromJson(json) {
        return new HMIPWSIndoorClimateGroup({
            id: json.id,
            homeId: json.homeId,
            metaGroupId: json.metaGroupId,
            label: json.label,
            lastStatusUpdate: json.lastStatusUpdate,
            unreach: json.unreach,
            lowBat: json.lowBat,
            dutyCycle: json.dutyCycle,
            channels: json.channels,
            processing: json.processing,
            ventilationState: json.ventilationState,
            ventilationLevel: json.ventilationLevel,
            windowState: json.windowState,
            sabotage: json.sabotage
        });
    }
}

module.exports = {HMIPWSIndoorClimateGroup}
