const {HMIPWSDevice} = require('./hmip-ws-device');

/**
 * HEATING_THERMOSTAT device
 */
class HMIPWSHeatingThermostatDevice extends HMIPWSDevice {
    /**
     * @param {object} params
     */
    constructor(params) {
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

    /**
     * @param {any} json
     * @returns {HMIPWSHeatingThermostatDevice}
     */
    static fromJson(json) {
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

module.exports = {HMIPWSHeatingThermostatDevice}
