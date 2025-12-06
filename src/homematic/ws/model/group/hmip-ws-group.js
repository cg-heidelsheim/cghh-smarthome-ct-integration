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
}

module.exports = {HMIPWSGroup}
