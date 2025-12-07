const {HMIPWSFunctionalChannel} = require('./hmip-ws-functional-channel');

/**
 * ACCESS_CONTROLLER_WIRED_CHANNEL
 *
 * Almost identical to operation lock
 */
class HMIPWSAccessControllerWiredChannel extends HMIPWSFunctionalChannel {
    constructor(params) {
        super(
            'ACCESS_CONTROLLER_WIRED_CHANNEL',
            params.deviceId,
            params.index,
            params.groupIndex,
            params.label,
            params.groups,
            params.supportedOptionalFeatures
        );

        this.unreach = params.unreach;
        this.lowBat = params.lowBat;
        this.routerModuleEnabled = params.routerModuleEnabled;
        this.multicastRoutingEnabled = params.multicastRoutingEnabled;
        this.routerModuleSupported = params.routerModuleSupported;
        this.rssiDeviceValue = params.rssiDeviceValue;
        this.rssiPeerValue = params.rssiPeerValue;
        this.configPending = params.configPending;
        this.dutyCycle = params.dutyCycle;
        this.deviceOverloaded = params.deviceOverloaded;
        this.coProUpdateFailure = params.coProUpdateFailure;
        this.coProFaulty = params.coProFaulty;
        this.coProRestartNeeded = params.coProRestartNeeded;
        this.deviceUndervoltage = params.deviceUndervoltage;
        this.deviceOverheated = params.deviceOverheated;
        this.temperatureOutOfRange = params.temperatureOutOfRange;
        this.devicePowerFailureDetected = params.devicePowerFailureDetected;
        this.busConfigMismatch = params.busConfigMismatch;
        this.powerShortCircuit = params.powerShortCircuit;
        this.shortCircuitDataLine = params.shortCircuitDataLine;
        this.profilePeriodLimitReached = params.profilePeriodLimitReached;
        this.mountingOrientation = params.mountingOrientation;
        this.controlsMountingOrientation = params.controlsMountingOrientation;
        this.displayMountingOrientation = params.displayMountingOrientation;
        this.displayMode = params.displayMode;
        this.invertedDisplayColors = params.invertedDisplayColors;
        this.temperatureHumiditySensorError = params.temperatureHumiditySensorError;
        this.temperatureHumiditySensorCommunicationError = params.temperatureHumiditySensorCommunicationError;
        this.particulateMatterSensorError = params.particulateMatterSensorError;
        this.particulateMatterSensorCommunicationError = params.particulateMatterSensorCommunicationError;
        this.sensorError = params.sensorError;
        this.sensorCommunicationError = params.sensorCommunicationError;
        this.displayContrast = params.displayContrast;
        this.lockJammed = params.lockJammed;
        this.deviceDriveError = params.deviceDriveError;
        this.deviceDriveModeError = params.deviceDriveModeError;
        this.deviceCommunicationError = params.deviceCommunicationError;
        this.daliBusState = params.daliBusState;
        this.deviceOperationMode = params.deviceOperationMode;
        this.defaultLinkedGroup = params.defaultLinkedGroup;
        this.operationDays = params.operationDays;
        this.deviceAliveSignalEnabled = params.deviceAliveSignalEnabled;
        this.altitude = params.altitude;
        this.mountingModuleError = params.mountingModuleError;
        this.inputLayoutMode = params.inputLayoutMode;
        this.switchChannelMode = params.switchChannelMode;
        this.frostProtectionError = params.frostProtectionError;
        this.frostProtectionErrorAcknowledged = params.frostProtectionErrorAcknowledged;
        this.valveFlowError = params.valveFlowError;
        this.valveWaterError = params.valveWaterError;
        this.noDataFromLinkyError = params.noDataFromLinkyError;
        this.dataDecodingFailedError = params.dataDecodingFailedError;
        this.ticVersionError = params.ticVersionError;
        this.deviceCanBusError = params.deviceCanBusError;
        this.notRechargeableBattery = params.notRechargeableBattery;
        this.fanControlMode = params.fanControlMode;
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
            label: json.label,
            deviceId: json.deviceId,
            index: json.index,
            groupIndex: json.groupIndex,
            groups: json.groups,
            unreach: json.unreach,
            lowBat: json.lowBat,
            routerModuleEnabled: json.routerModuleEnabled,
            multicastRoutingEnabled: json.multicastRoutingEnabled,
            routerModuleSupported: json.routerModuleSupported,
            rssiDeviceValue: json.rssiDeviceValue,
            rssiPeerValue: json.rssiPeerValue,
            configPending: json.configPending,
            dutyCycle: json.dutyCycle,
            deviceOverloaded: json.deviceOverloaded,
            coProUpdateFailure: json.coProUpdateFailure,
            coProFaulty: json.coProFaulty,
            coProRestartNeeded: json.coProRestartNeeded,
            deviceUndervoltage: json.deviceUndervoltage,
            deviceOverheated: json.deviceOverheated,
            temperatureOutOfRange: json.temperatureOutOfRange,
            devicePowerFailureDetected: json.devicePowerFailureDetected,
            supportedOptionalFeatures: json.supportedOptionalFeatures,
            busConfigMismatch: json.busConfigMismatch,
            powerShortCircuit: json.powerShortCircuit,
            shortCircuitDataLine: json.shortCircuitDataLine,
            profilePeriodLimitReached: json.profilePeriodLimitReached,
            mountingOrientation: json.mountingOrientation,
            controlsMountingOrientation: json.controlsMountingOrientation,
            displayMountingOrientation: json.displayMountingOrientation,
            displayMode: json.displayMode,
            invertedDisplayColors: json.invertedDisplayColors,
            temperatureHumiditySensorError: json.temperatureHumiditySensorError,
            temperatureHumiditySensorCommunicationError: json.temperatureHumiditySensorCommunicationError,
            particulateMatterSensorError: json.particulateMatterSensorError,
            particulateMatterSensorCommunicationError: json.particulateMatterSensorCommunicationError,
            sensorError: json.sensorError,
            sensorCommunicationError: json.sensorCommunicationError,
            displayContrast: json.displayContrast,
            lockJammed: json.lockJammed,
            deviceDriveError: json.deviceDriveError,
            deviceDriveModeError: json.deviceDriveModeError,
            deviceCommunicationError: json.deviceCommunicationError,
            daliBusState: json.daliBusState,
            deviceOperationMode: json.deviceOperationMode,
            defaultLinkedGroup: json.defaultLinkedGroup,
            operationDays: json.operationDays,
            deviceAliveSignalEnabled: json.deviceAliveSignalEnabled,
            altitude: json.altitude,
            mountingModuleError: json.mountingModuleError,
            inputLayoutMode: json.inputLayoutMode,
            switchChannelMode: json.switchChannelMode,
            frostProtectionError: json.frostProtectionError,
            frostProtectionErrorAcknowledged: json.frostProtectionErrorAcknowledged,
            valveFlowError: json.valveFlowError,
            valveWaterError: json.valveWaterError,
            noDataFromLinkyError: json.noDataFromLinkyError,
            dataDecodingFailedError: json.dataDecodingFailedError,
            ticVersionError: json.ticVersionError,
            deviceCanBusError: json.deviceCanBusError,
            notRechargeableBattery: json.notRechargeableBattery,
            fanControlMode: json.fanControlMode,
            busMode: json.busMode,
            powerSupplyCurrent: json.powerSupplyCurrent,
            signalBrightness: json.signalBrightness,
            accessPointPriority: json.accessPointPriority,
            filteredMulticastRoutingEnabled: json.filteredMulticastRoutingEnabled
        });
    }
}

module.exports = {HMIPWSAccessControllerWiredChannel}
