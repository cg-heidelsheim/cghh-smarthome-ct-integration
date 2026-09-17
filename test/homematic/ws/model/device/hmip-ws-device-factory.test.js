const { createDeviceFromJson } = require('../../../../../src/homematic/ws/model/device/hmip-ws-device-factory');
const { HMIPWSHeatingThermostatDevice } = require('../../../../../src/homematic/ws/model/device/hmip-ws-device-heating-thermostat');

describe('createDeviceFromJson (device factory dispatch)', () => {
  it('dispatches type=HEATING_THERMOSTAT to HMIPWSHeatingThermostatDevice and converts nested functionalChannels', () => {
    const json = {
      id: 'device-1',
      type: 'HEATING_THERMOSTAT',
      homeId: 'home-1',
      lastStatusUpdate: 123,
      label: 'Heizkörper',
      functionalChannels: {
        0: { functionalChannelType: 'HEATING_THERMOSTAT_CHANNEL', deviceId: 'device-1', index: 0, groupIndex: 1 },
      },
    };

    const result = createDeviceFromJson(json);

    expect(result).toBeInstanceOf(HMIPWSHeatingThermostatDevice);
    expect(result.functionalChannels).toHaveLength(1);
  });

  it('returns undefined for an unknown device type instead of throwing', () => {
    expect(createDeviceFromJson({ id: 'x', type: 'SOME_NEW_DEVICE_TYPE', functionalChannels: {} })).toBeUndefined();
  });

  it('throws when json is missing', () => {
    expect(() => createDeviceFromJson(undefined)).toThrow('createDeviceFromJson: device json missing');
  });

  it('treats a device with no functionalChannels as an empty list rather than throwing', () => {
    expect(() => createDeviceFromJson({ id: 'x', type: 'SOME_NEW_DEVICE_TYPE' })).not.toThrow();
  });
});
