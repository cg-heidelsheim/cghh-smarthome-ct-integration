const {HMIPWSDiagnosticChannel} = require('./hmip-ws-functional-channel-diagnostic');

/**
 * ACCESS_CONTROLLER_WIRED_CHANNEL
 */
class HMIPWSAccessControllerWiredChannel extends HMIPWSDiagnosticChannel {
    constructor(params) {
        super('ACCESS_CONTROLLER_WIRED_CHANNEL', params);

        this.busMode = params.busMode;
        this.powerSupplyCurrent = params.powerSupplyCurrent;
        this.signalBrightness = params.signalBrightness;
        this.accessPointPriority = params.accessPointPriority;
        this.filteredMulticastRoutingEnabled = params.filteredMulticastRoutingEnabled;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSAccessControllerWiredChannel}
     */
    static fromJson(json) {
        return new HMIPWSAccessControllerWiredChannel({
            ...HMIPWSDiagnosticChannel.baseFieldsFromJson(json),
            busMode: json.busMode,
            powerSupplyCurrent: json.powerSupplyCurrent,
            signalBrightness: json.signalBrightness,
            accessPointPriority: json.accessPointPriority,
            filteredMulticastRoutingEnabled: json.filteredMulticastRoutingEnabled
        });
    }
}

module.exports = {HMIPWSAccessControllerWiredChannel};
