const { HMIPWSDeviceOperationLockChannel } = require('../../../../../../src/homematic/ws/model/device/channel/hmip-ws-functional-channel-operation-lock');
const { HMIPWSAccessControllerWiredChannel } = require('../../../../../../src/homematic/ws/model/device/channel/hmip-ws-functional-channel-access-controller-wired');
const { HMIPWSHeatingThermostatChannel } = require('../../../../../../src/homematic/ws/model/device/channel/hmip-ws-functional-channel-heating-thermostat');
const { HMIPWSWallMountedThermostatChannel } = require('../../../../../../src/homematic/ws/model/device/channel/hmip-ws-functional-channel-wall-mounted-thermostat');
const { createFunctionalChannelFromJson } = require('../../../../../../src/homematic/ws/model/device/channel/hmip-ws-functional-channel-factory');

// Shared base-class fields every functional channel is supposed to carry
// (see HMIPWSFunctionalChannel's constructor).
const baseFixture = {
  deviceId: 'device-1',
  index: 0,
  groupIndex: 1,
  label: 'Ventil Wohnzimmer',
  groups: ['group-a', 'group-b'],
  supportedOptionalFeatures: { IFeatureFirmwareUpdate: true },
};

describe('HMIPWSDeviceOperationLockChannel.fromJson', () => {
  it('maps deviceId/index/groupIndex and the operationLockActive field', () => {
    const json = { ...baseFixture, functionalChannelType: 'DEVICE_OPERATIONLOCK', operationLockActive: true };
    const result = HMIPWSDeviceOperationLockChannel.fromJson(json);

    expect(result.deviceId).toBe('device-1');
    expect(result.index).toBe(0);
    expect(result.groupIndex).toBe(1);
    expect(result.operationLockActive).toBe(true);
  });

  it('FIXED (was: KNOWN BUG): now preserves label/groups/supportedOptionalFeatures via the shared HMIPWSDiagnosticChannel base', () => {
    const json = { ...baseFixture, functionalChannelType: 'DEVICE_OPERATIONLOCK', operationLockActive: true };
    const result = HMIPWSDeviceOperationLockChannel.fromJson(json);

    expect(result.label).toBe(baseFixture.label);
    expect(result.groups).toEqual(baseFixture.groups);
    expect(result.supportedOptionalFeatures).toEqual(baseFixture.supportedOptionalFeatures);
  });
});

describe('HMIPWSAccessControllerWiredChannel.fromJson', () => {
  it('maps deviceId/index/groupIndex and label/groups/supportedOptionalFeatures correctly', () => {
    const json = { ...baseFixture, functionalChannelType: 'ACCESS_CONTROLLER_WIRED_CHANNEL', busMode: 'RS485' };
    const result = HMIPWSAccessControllerWiredChannel.fromJson(json);

    expect(result.deviceId).toBe('device-1');
    expect(result.index).toBe(0);
    expect(result.groupIndex).toBe(1);
    expect(result.busMode).toBe('RS485');
    expect(result.label).toBe('Ventil Wohnzimmer');
    expect(result.groups).toEqual(['group-a', 'group-b']);
    expect(result.supportedOptionalFeatures).toEqual({ IFeatureFirmwareUpdate: true });
  });
});

describe('label/groups/supportedOptionalFeatures survival across all four functional-channel classes (FIXED — previously only access-controller-wired preserved these)', () => {
  it.each([
    ['HMIPWSDeviceOperationLockChannel', () => HMIPWSDeviceOperationLockChannel.fromJson({ ...baseFixture, operationLockActive: true })],
    ['HMIPWSAccessControllerWiredChannel', () => HMIPWSAccessControllerWiredChannel.fromJson({ ...baseFixture })],
    ['HMIPWSHeatingThermostatChannel', () => HMIPWSHeatingThermostatChannel.fromJson({ ...baseFixture, channelRole: 'HEATING' })],
    ['HMIPWSWallMountedThermostatChannel', () => HMIPWSWallMountedThermostatChannel.fromJson({ ...baseFixture, channelRole: 'WALL' })],
  ])('%s preserves label/groups/supportedOptionalFeatures', (_name, build) => {
    const result = build();
    expect(result.label).toBe(baseFixture.label);
    expect(result.groups).toEqual(baseFixture.groups);
    expect(result.supportedOptionalFeatures).toEqual(baseFixture.supportedOptionalFeatures);
  });
});

describe('HMIPWSDiagnosticChannel shared base (de-duplicated from the two previously ~95%-identical classes)', () => {
  it('both DEVICE_OPERATIONLOCK and ACCESS_CONTROLLER_WIRED_CHANNEL carry the full shared diagnostic field set', () => {
    const diagnosticFixture = { ...baseFixture, unreach: true, lowBat: false, dutyCycle: true, sensorError: false };

    const lockResult = HMIPWSDeviceOperationLockChannel.fromJson({ ...diagnosticFixture, operationLockActive: true });
    const accessResult = HMIPWSAccessControllerWiredChannel.fromJson({ ...diagnosticFixture, busMode: 'RS485' });

    for (const result of [lockResult, accessResult]) {
      expect(result.unreach).toBe(true);
      expect(result.lowBat).toBe(false);
      expect(result.dutyCycle).toBe(true);
      expect(result.sensorError).toBe(false);
    }

    // each subclass still only carries its own unique field(s)
    expect(lockResult.operationLockActive).toBe(true);
    expect(lockResult.busMode).toBeUndefined();
    expect(accessResult.busMode).toBe('RS485');
    expect(accessResult.operationLockActive).toBeUndefined();
  });
});

describe('createFunctionalChannelFromJson (channel factory dispatch)', () => {
  it('dispatches known functionalChannelType values to the matching class', () => {
    expect(createFunctionalChannelFromJson({ ...baseFixture, functionalChannelType: 'DEVICE_OPERATIONLOCK' }))
      .toBeInstanceOf(HMIPWSDeviceOperationLockChannel);
    expect(createFunctionalChannelFromJson({ ...baseFixture, functionalChannelType: 'ACCESS_CONTROLLER_WIRED_CHANNEL' }))
      .toBeInstanceOf(HMIPWSAccessControllerWiredChannel);
    expect(createFunctionalChannelFromJson({ ...baseFixture, functionalChannelType: 'HEATING_THERMOSTAT_CHANNEL' }))
      .toBeInstanceOf(HMIPWSHeatingThermostatChannel);
    expect(createFunctionalChannelFromJson({ ...baseFixture, functionalChannelType: 'WALL_MOUNTED_THERMOSTAT_PRO_CHANNEL' }))
      .toBeInstanceOf(HMIPWSWallMountedThermostatChannel);
  });

  it('returns undefined for an unknown functionalChannelType instead of throwing', () => {
    expect(createFunctionalChannelFromJson({ ...baseFixture, functionalChannelType: 'SOME_NEW_UNKNOWN_CHANNEL' })).toBeUndefined();
  });

  it('throws when json is missing', () => {
    expect(() => createFunctionalChannelFromJson(undefined)).toThrow('createFunctionalChannelFromJson: missing json');
  });
});
