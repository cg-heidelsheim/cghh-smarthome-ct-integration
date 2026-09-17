const {DeviceStateBuilder} = require('../../../src/homematic/device/device-state.builder');
const {HMIPWSHeatingThermostatChannel} = require('../../../src/homematic/ws/model/device/channel/hmip-ws-functional-channel-heating-thermostat');

describe('DeviceStateBuilder', () => {
  describe('fromHomematicDevice', () => {
    it('keeps only heating-thermostat channels and maps their fields', () => {
      const heatingChannel = new HMIPWSHeatingThermostatChannel({
        index: 1,
        valvePosition: 0.5,
        valveActualTemperature: 19.5,
        setPointTemperature: 21,
      });
      const otherChannel = {index: 0}; // not an HMIPWSHeatingThermostatChannel instance
      const device = {id: 'd1', label: 'Thermostat', functionalChannels: [otherChannel, heatingChannel]};

      const state = DeviceStateBuilder.fromHomematicDevice(device);

      expect(state.id).toBe('d1');
      expect(state.label).toBe('Thermostat');
      expect(state.channels).toHaveLength(1);
      expect(state.channels[0]).toMatchObject({
        index: 1,
        valvePosition: 0.5,
        temperature: 19.5,
        setTemperature: 21,
      });
    });

    it('produces an empty channel list when there are no functional channels', () => {
      const state = DeviceStateBuilder.fromHomematicDevice({id: 'd1', label: 'Thermostat'});

      expect(state.channels).toEqual([]);
    });
  });

  describe('dummyState', () => {
    it('builds a placeholder state labeled INIT with no channels', () => {
      const state = DeviceStateBuilder.dummyState('d1');

      expect(state.id).toBe('d1');
      expect(state.label).toBe('INIT');
      expect(state.channels).toEqual([]);
    });
  });
});
