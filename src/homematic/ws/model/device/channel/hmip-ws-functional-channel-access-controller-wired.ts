import {HMIPWSDiagnosticChannel, type HMIPWSDiagnosticChannelParams} from './hmip-ws-functional-channel-diagnostic';

interface HMIPWSAccessControllerWiredChannelParams extends HMIPWSDiagnosticChannelParams {
    busMode?: unknown;
    powerSupplyCurrent?: unknown;
    signalBrightness?: unknown;
    accessPointPriority?: unknown;
    filteredMulticastRoutingEnabled?: unknown;
}

/**
 * ACCESS_CONTROLLER_WIRED_CHANNEL
 */
export class HMIPWSAccessControllerWiredChannel extends HMIPWSDiagnosticChannel {
    busMode?: unknown;
    powerSupplyCurrent?: unknown;
    signalBrightness?: unknown;
    accessPointPriority?: unknown;
    filteredMulticastRoutingEnabled?: unknown;

    constructor(params: HMIPWSAccessControllerWiredChannelParams) {
        super('ACCESS_CONTROLLER_WIRED_CHANNEL', params);

        this.busMode = params.busMode;
        this.powerSupplyCurrent = params.powerSupplyCurrent;
        this.signalBrightness = params.signalBrightness;
        this.accessPointPriority = params.accessPointPriority;
        this.filteredMulticastRoutingEnabled = params.filteredMulticastRoutingEnabled;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSAccessControllerWiredChannel {
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
