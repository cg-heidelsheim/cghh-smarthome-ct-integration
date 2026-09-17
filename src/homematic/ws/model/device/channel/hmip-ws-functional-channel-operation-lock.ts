import {HMIPWSDiagnosticChannel, type HMIPWSDiagnosticChannelParams} from './hmip-ws-functional-channel-diagnostic';

interface HMIPWSDeviceOperationLockChannelParams extends HMIPWSDiagnosticChannelParams {
    operationLockActive?: unknown;
}

/**
 * DEVICE_OPERATIONLOCK channel
 */
export class HMIPWSDeviceOperationLockChannel extends HMIPWSDiagnosticChannel {
    operationLockActive?: unknown;

    constructor(params: HMIPWSDeviceOperationLockChannelParams) {
        super('DEVICE_OPERATIONLOCK', params);

        this.operationLockActive = params.operationLockActive;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSDeviceOperationLockChannel {
        return new HMIPWSDeviceOperationLockChannel({
            ...HMIPWSDiagnosticChannel.baseFieldsFromJson(json),
            operationLockActive: json.operationLockActive
        });
    }
}
