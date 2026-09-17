const {HMIPWSDiagnosticChannel} = require('./hmip-ws-functional-channel-diagnostic');

/**
 * DEVICE_OPERATIONLOCK channel
 */
class HMIPWSDeviceOperationLockChannel extends HMIPWSDiagnosticChannel {
    constructor(params) {
        super('DEVICE_OPERATIONLOCK', params);

        this.operationLockActive = params.operationLockActive;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSDeviceOperationLockChannel}
     */
    static fromJson(json) {
        return new HMIPWSDeviceOperationLockChannel({
            ...HMIPWSDiagnosticChannel.baseFieldsFromJson(json),
            operationLockActive: json.operationLockActive
        });
    }
}

module.exports = {HMIPWSDeviceOperationLockChannel};
