const {HMIPWSFunctionalChannel} = require('./hmip-ws-functional-channel');

/**
 * DEVICE_OPERATIONLOCK channel
 */
class HMIPWSDeviceOperationLockChannel extends HMIPWSFunctionalChannel {
    constructor(params) {
        super(
            'DEVICE_OPERATIONLOCK',
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

        // all the nullable / diagnostic flags explicitly:
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
        this.temperatureHumiditySensorCommunicationError =
            params.temperatureHumiditySensorCommunicationError;
        this.particulateMatterSensorError = params.particulateMatterSensorError;
        this.particulateMatterSensorCommunicationError =
            params.particulateMatterSensorCommunicationError;
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
        this.frostProtectionErrorAcknowledged =
            params.frostProtectionErrorAcknowledged;
        this.valveFlowError = params.valveFlowError;
        this.valveWaterError = params.valveWaterError;
        this.noDataFromLinkyError = params.noDataFromLinkyError;
        this.dataDecodingFailedError = params.dataDecodingFailedError;
        this.ticVersionError = params.ticVersionError;
        this.deviceCanBusError = params.deviceCanBusError;
        this.notRechargeableBattery = params.notRechargeableBattery;
        this.fanControlMode = params.fanControlMode;

        this.operationLockActive = params.operationLockActive;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSDeviceOperationLockChannel}
     */
    static fromJson(json) {
        const {
            deviceId,
            index,
            groupIndex,
            unreach,
            lowBat,
            routerModuleEnabled,
            multicastRoutingEnabled,
            routerModuleSupported,
            rssiDeviceValue,
            rssiPeerValue,
            configPending,
            dutyCycle,
            deviceOverloaded,
            coProUpdateFailure,
            coProFaulty,
            coProRestartNeeded,
            deviceUndervoltage,
            deviceOverheated,
            temperatureOutOfRange,
            devicePowerFailureDetected,
            busConfigMismatch,
            powerShortCircuit,
            shortCircuitDataLine,
            profilePeriodLimitReached,
            mountingOrientation,
            controlsMountingOrientation,
            displayMountingOrientation,
            displayMode,
            invertedDisplayColors,
            temperatureHumiditySensorError,
            temperatureHumiditySensorCommunicationError,
            particulateMatterSensorError,
            particulateMatterSensorCommunicationError,
            sensorError,
            sensorCommunicationError,
            displayContrast,
            lockJammed,
            deviceDriveError,
            deviceDriveModeError,
            deviceCommunicationError,
            daliBusState,
            deviceOperationMode,
            defaultLinkedGroup,
            operationDays,
            deviceAliveSignalEnabled,
            altitude,
            mountingModuleError,
            inputLayoutMode,
            switchChannelMode,
            frostProtectionError,
            frostProtectionErrorAcknowledged,
            valveFlowError,
            valveWaterError,
            noDataFromLinkyError,
            dataDecodingFailedError,
            ticVersionError,
            deviceCanBusError,
            notRechargeableBattery,
            fanControlMode,
            operationLockActive
        } = json;

        return new HMIPWSDeviceOperationLockChannel({
            deviceId,
            index,
            groupIndex,
            unreach,
            lowBat,
            routerModuleEnabled,
            multicastRoutingEnabled,
            routerModuleSupported,
            rssiDeviceValue,
            rssiPeerValue,
            configPending,
            dutyCycle,
            deviceOverloaded,
            coProUpdateFailure,
            coProFaulty,
            coProRestartNeeded,
            deviceUndervoltage,
            deviceOverheated,
            temperatureOutOfRange,
            devicePowerFailureDetected,

            busConfigMismatch,
            powerShortCircuit,
            shortCircuitDataLine,
            profilePeriodLimitReached,
            mountingOrientation,
            controlsMountingOrientation,
            displayMountingOrientation,
            displayMode,
            invertedDisplayColors,
            temperatureHumiditySensorError,
            temperatureHumiditySensorCommunicationError,
            particulateMatterSensorError,
            particulateMatterSensorCommunicationError,
            sensorError,
            sensorCommunicationError,
            displayContrast,
            lockJammed,
            deviceDriveError,
            deviceDriveModeError,
            deviceCommunicationError,
            daliBusState,
            deviceOperationMode,
            defaultLinkedGroup,
            operationDays,
            deviceAliveSignalEnabled,
            altitude,
            mountingModuleError,
            inputLayoutMode,
            switchChannelMode,
            frostProtectionError,
            frostProtectionErrorAcknowledged,
            valveFlowError,
            valveWaterError,
            noDataFromLinkyError,
            dataDecodingFailedError,
            ticVersionError,
            deviceCanBusError,
            notRechargeableBattery,
            fanControlMode,

            operationLockActive
        });
    }
}

module.exports = {HMIPWSDeviceOperationLockChannel}