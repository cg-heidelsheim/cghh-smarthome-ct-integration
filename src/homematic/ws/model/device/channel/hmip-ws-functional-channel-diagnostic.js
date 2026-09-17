const {HMIPWSFunctionalChannel} = require('./hmip-ws-functional-channel');

/**
 * Shared diagnostic field set for HMIP channel types that report the same large bag of
 * device-health attributes (unreach, lowBat, sensor/communication errors, ...).
 * DEVICE_OPERATIONLOCK and ACCESS_CONTROLLER_WIRED_CHANNEL were previously two ~95%-identical
 * copy-pasted classes; this base class holds what they share, with each subclass adding only
 * its own few unique fields.
 */
class HMIPWSDiagnosticChannel extends HMIPWSFunctionalChannel {
    constructor(functionalChannelType, params) {
        super(
            functionalChannelType,
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
    }

    /**
     * Extract the fields shared by every diagnostic channel type (including the base
     * HMIPWSFunctionalChannel fields label/groups/supportedOptionalFeatures, previously
     * dropped by DEVICE_OPERATIONLOCK's own fromJson) out of a raw WS json payload.
     *
     * @param {any} json
     * @returns {object}
     */
    static baseFieldsFromJson(json) {
        const result = {};
        for (const field of HMIPWSDiagnosticChannel.FIELDS) {
            result[field] = json[field];
        }
        return result;
    }
}

HMIPWSDiagnosticChannel.FIELDS = [
    'deviceId', 'index', 'groupIndex', 'label', 'groups', 'supportedOptionalFeatures',
    'unreach', 'lowBat', 'routerModuleEnabled', 'multicastRoutingEnabled', 'routerModuleSupported',
    'rssiDeviceValue', 'rssiPeerValue', 'configPending', 'dutyCycle', 'deviceOverloaded',
    'coProUpdateFailure', 'coProFaulty', 'coProRestartNeeded', 'deviceUndervoltage', 'deviceOverheated',
    'temperatureOutOfRange', 'devicePowerFailureDetected', 'busConfigMismatch', 'powerShortCircuit',
    'shortCircuitDataLine', 'profilePeriodLimitReached', 'mountingOrientation', 'controlsMountingOrientation',
    'displayMountingOrientation', 'displayMode', 'invertedDisplayColors', 'temperatureHumiditySensorError',
    'temperatureHumiditySensorCommunicationError', 'particulateMatterSensorError',
    'particulateMatterSensorCommunicationError', 'sensorError', 'sensorCommunicationError', 'displayContrast',
    'lockJammed', 'deviceDriveError', 'deviceDriveModeError', 'deviceCommunicationError', 'daliBusState',
    'deviceOperationMode', 'defaultLinkedGroup', 'operationDays', 'deviceAliveSignalEnabled', 'altitude',
    'mountingModuleError', 'inputLayoutMode', 'switchChannelMode', 'frostProtectionError',
    'frostProtectionErrorAcknowledged', 'valveFlowError', 'valveWaterError', 'noDataFromLinkyError',
    'dataDecodingFailedError', 'ticVersionError', 'deviceCanBusError', 'notRechargeableBattery', 'fanControlMode'
];

module.exports = {HMIPWSDiagnosticChannel};
