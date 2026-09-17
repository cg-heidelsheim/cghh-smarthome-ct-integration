import {HMIPWSDevice} from './hmip-ws-device';
import type {HMIPWSFunctionalChannel} from './channel/hmip-ws-functional-channel';

interface HMIPWSHeatingThermostatDeviceParams {
    id: string;
    type: string;
    homeId: string;
    lastStatusUpdate: number;
    label: string;
    functionalChannels: HMIPWSFunctionalChannel[];
    deviceArchetype?: unknown;
    manuallyUpdateForced?: unknown;
    automaticValveAdaptionNeeded?: unknown;
    updateState?: unknown;
    firmwareVersion?: unknown;
    modelType?: unknown;
    permanentlyReachable?: unknown;
    connectionType?: unknown;
    manufacturerCode?: unknown;
    oem?: unknown;
    measuredAttributes?: unknown;
    modelId?: unknown;
    liveUpdateState?: unknown;
    availableFirmwareVersion?: unknown;
    firmwareVersionInteger?: unknown;
    serializedGlobalTradeItemNumber?: unknown;
}

/**
 * HEATING_THERMOSTAT device
 */
export class HMIPWSHeatingThermostatDevice extends HMIPWSDevice {
    deviceArchetype?: unknown;
    manuallyUpdateForced?: unknown;
    automaticValveAdaptionNeeded?: unknown;
    updateState?: unknown;
    firmwareVersion?: unknown;
    modelType?: unknown;
    permanentlyReachable?: unknown;
    connectionType?: unknown;
    manufacturerCode?: unknown;
    oem?: unknown;
    measuredAttributes?: unknown;
    modelId?: unknown;
    liveUpdateState?: unknown;
    availableFirmwareVersion?: unknown;
    firmwareVersionInteger?: unknown;
    serializedGlobalTradeItemNumber?: unknown;

    constructor(params: HMIPWSHeatingThermostatDeviceParams) {
        super(
            params.id,
            params.type,
            params.homeId,
            params.lastStatusUpdate,
            params.label,
            params.functionalChannels
        );

        // explicitly list / expose all known attributes
        this.deviceArchetype = params.deviceArchetype;
        this.manuallyUpdateForced = params.manuallyUpdateForced;
        this.automaticValveAdaptionNeeded = params.automaticValveAdaptionNeeded;
        this.updateState = params.updateState;
        this.firmwareVersion = params.firmwareVersion;
        this.modelType = params.modelType;
        this.permanentlyReachable = params.permanentlyReachable;
        this.connectionType = params.connectionType;
        this.manufacturerCode = params.manufacturerCode;
        this.oem = params.oem;
        this.measuredAttributes = params.measuredAttributes;
        this.modelId = params.modelId;
        this.liveUpdateState = params.liveUpdateState;
        this.availableFirmwareVersion = params.availableFirmwareVersion;
        this.firmwareVersionInteger = params.firmwareVersionInteger;
        this.serializedGlobalTradeItemNumber = params.serializedGlobalTradeItemNumber;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSHeatingThermostatDevice {
        return new HMIPWSHeatingThermostatDevice({
            id: json.id,
            type: json.type,
            homeId: json.homeId,
            lastStatusUpdate: json.lastStatusUpdate,
            label: json.label,
            functionalChannels: json.functionalChannels,
            deviceArchetype: json.deviceArchetype,
            manuallyUpdateForced: json.manuallyUpdateForced,
            automaticValveAdaptionNeeded: json.automaticValveAdaptionNeeded,
            updateState: json.updateState,
            firmwareVersion: json.firmwareVersion,
            modelType: json.modelType,
            permanentlyReachable: json.permanentlyReachable,
            connectionType: json.connectionType,
            manufacturerCode: json.manufacturerCode,
            oem: json.oem,
            measuredAttributes: json.measuredAttributes,
            modelId: json.modelId,
            liveUpdateState: json.liveUpdateState,
            availableFirmwareVersion: json.availableFirmwareVersion,
            firmwareVersionInteger: json.firmwareVersionInteger,
            serializedGlobalTradeItemNumber: json.serializedGlobalTradeItemNumber
        });
    }
}
