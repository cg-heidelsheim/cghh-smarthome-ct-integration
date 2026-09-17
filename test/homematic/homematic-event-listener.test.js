// Characterization tests for the group/device/weather "diff -> persist -> log" handler
// triplet. This file is the intended target of a later refactor (collapsing the three
// near-identical handlers into one generic, config-driven sync handler) — these tests
// exist to pin down today's exact behavior first, so that refactor has a regression net.
//
// None of the internal handlers are exported (only `startEventListener` is), so we drive
// them through the public entrypoint: mock `WebsocketManager` to capture the callback it
// registers, then invoke that callback with a fabricated WS payload. `HMIPWSMessage.fromJson`
// is mocked to hand back real (unmocked) WS model instances, so `instanceof` checks inside
// the listener behave exactly as in production.

jest.mock('../../src/websocket-manager', () => ({
  WebsocketManager: jest.fn().mockImplementation(() => ({
    setHeaders: jest.fn(),
    connect: jest.fn().mockImplementation((cb) => {
      global.__capturedWsCallback = cb;
      return Promise.resolve();
    }),
  })),
}));

jest.mock('../../src/homematic/ws/model/hmip-ws-message', () => ({
  HMIPWSMessage: {fromJson: jest.fn()},
}));

function mockDb() {
  const instance = {getById: jest.fn(), save: jest.fn()};
  return {instance, ctor: jest.fn(() => instance)};
}

const groupDb = mockDb();
jest.mock('../../src/db/group-state.db', () => ({GroupStateDB: groupDb.ctor}));

const deviceDb = mockDb();
jest.mock('../../src/db/device-state.db', () => ({DeviceStateDB: deviceDb.ctor}));

const weatherDb = mockDb();
jest.mock('../../src/db/weather-state.db', () => ({WeatherStateDB: weatherDb.ctor}));

jest.mock('../../src/homematic/group/group-state.builder', () => ({
  GroupStateBuilder: {fromHomematicGroup: jest.fn(), dummyState: jest.fn()},
}));
jest.mock('../../src/homematic/device/device-state.builder', () => ({
  DeviceStateBuilder: {fromHomematicDevice: jest.fn(), dummyState: jest.fn()},
}));
jest.mock('../../src/homematic/weather/weather-state.builder', () => ({
  WeatherStateBuilder: {fromHomematicHome: jest.fn(), dummyState: jest.fn()},
}));

function mockDataSender() {
  const instance = {sendData: jest.fn()};
  return {instance, ctor: jest.fn(() => instance)};
}

const groupSender = mockDataSender();
jest.mock('../../src/timeseries/group.data-sender', () => ({GroupDataSender: groupSender.ctor}));
const deviceSender = mockDataSender();
jest.mock('../../src/timeseries/device.data-sender', () => ({DeviceDataSender: deviceSender.ctor}));
const weatherSender = mockDataSender();
jest.mock('../../src/timeseries/weather.data-sender', () => ({WeatherDataSender: weatherSender.ctor}));

jest.mock('../../src/util/event.logger', () => ({
  EventLogger: {
    wsGroupChange: jest.fn(),
    wsDeviceUpdateDebug: jest.fn(),
    weatherUpdateDebug: jest.fn(),
  },
}));

const {startEventListener} = require('../../src/homematic/homematic-event-listener');
const {HMIPWSMessage} = require('../../src/homematic/ws/model/hmip-ws-message');
const {GroupStateBuilder} = require('../../src/homematic/group/group-state.builder');
const {DeviceStateBuilder} = require('../../src/homematic/device/device-state.builder');
const {WeatherStateBuilder} = require('../../src/homematic/weather/weather-state.builder');
const {EventLogger} = require('../../src/util/event.logger');

const {HMIPWSGroupChangedEvent} = require('../../src/homematic/ws/model/event/hmip-ws-event-group-changed');
const {HMIPWSDeviceChangedEvent} = require('../../src/homematic/ws/model/event/hmip-ws-event-device-changed');
const {HMIPWSHomeChangedEvent} = require('../../src/homematic/ws/model/event/hmip-ws-event-home-changed');
const {HMIPWSHeatingGroup} = require('../../src/homematic/ws/model/group/hmip-ws-group-heating');
const {HMIPWSHeatingThermostatDevice} = require('../../src/homematic/ws/model/device/hmip-ws-device-heating-thermostat');
const {HMIPWSHome} = require('../../src/homematic/ws/model/home/hmip-ws-home');

describe('homematic-event-listener (startEventListener)', () => {
  let deliver;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.HOMEMATIC_WS_URL = 'wss://example.invalid';
    startEventListener();
    // connect() is called synchronously inside startEventListener but is itself async;
    // flush microtasks so global.__capturedWsCallback is set before tests use it.
    await Promise.resolve();
    deliver = (events) => {
      HMIPWSMessage.fromJson.mockReturnValue({events});
      global.__capturedWsCallback(Buffer.from('{}'));
    };
  });

  describe('handleGroupChangeEvent', () => {
    it('ignores a non-heating group entirely', () => {
      deliver([new HMIPWSGroupChangedEvent({id: 'g1'})]); // plain object, not an HMIPWSHeatingGroup

      expect(groupDb.instance.getById).not.toHaveBeenCalled();
    });

    it('loads the current state, builds the updated state, and does nothing when unchanged', () => {
      const group = new HMIPWSHeatingGroup({id: 'g1', label: 'Saal'});
      const currentState = {id: 'g1', label: 'Saal', lock: undefined, equalsValueAttributes: jest.fn(() => true)};
      groupDb.instance.getById.mockReturnValue(currentState);
      GroupStateBuilder.fromHomematicGroup.mockReturnValue({id: 'g1', label: 'Saal'});

      deliver([new HMIPWSGroupChangedEvent(group)]);

      expect(currentState.equalsValueAttributes).toHaveBeenCalled();
      expect(groupSender.instance.sendData).not.toHaveBeenCalled();
      expect(groupDb.instance.save).not.toHaveBeenCalled();
      expect(EventLogger.wsGroupChange).not.toHaveBeenCalled();
    });

    it('sends to Influx, persists, and logs when the state changed', () => {
      const group = new HMIPWSHeatingGroup({id: 'g1', label: 'Saal'});
      const currentState = {id: 'g1', label: 'Saal', lock: 'some-lock', equalsValueAttributes: jest.fn(() => false)};
      const updatedState = {id: 'g1', label: 'Saal', setTemperature: 21};
      groupDb.instance.getById.mockReturnValue(currentState);
      GroupStateBuilder.fromHomematicGroup.mockReturnValue(updatedState);

      deliver([new HMIPWSGroupChangedEvent(group)]);

      // KNOWN BEHAVIOR: the previous state's `lock` is carried over onto the updated
      // state before persisting/logging — the updated state never has its own lock field.
      expect(updatedState.lock).toBe('some-lock');
      expect(groupSender.instance.sendData).toHaveBeenCalledWith(updatedState);
      expect(groupDb.instance.save).toHaveBeenCalledWith(updatedState);
      expect(EventLogger.wsGroupChange).toHaveBeenCalledWith(currentState, updatedState);
    });

    it('falls back to GroupStateBuilder.dummyState when no prior state exists on disk', () => {
      const group = new HMIPWSHeatingGroup({id: 'g1', label: 'Saal'});
      groupDb.instance.getById.mockImplementation(() => {
        throw new Error('not found');
      });
      GroupStateBuilder.dummyState.mockReturnValue({id: 'g1', label: 'INIT', equalsValueAttributes: () => true});
      GroupStateBuilder.fromHomematicGroup.mockReturnValue({id: 'g1', label: 'Saal'});

      deliver([new HMIPWSGroupChangedEvent(group)]);

      expect(GroupStateBuilder.dummyState).toHaveBeenCalledWith('g1');
    });
  });

  describe('handleDeviceChanged', () => {
    it('ignores a device that is not a heating thermostat', () => {
      deliver([new HMIPWSDeviceChangedEvent({id: 'd1'})]); // plain object, not HMIPWSHeatingThermostatDevice

      expect(deviceDb.instance.getById).not.toHaveBeenCalled();
    });

    it('per channel: sends + logs only channels that changed, but always saves the whole device state', () => {
      const device = new HMIPWSHeatingThermostatDevice({id: 'd1', label: 'Thermostat'});
      const unchangedChannel = {index: 1, equalsValueAttributes: jest.fn(() => true)};
      const changedChannel = {index: 2, equalsValueAttributes: jest.fn(() => false)};
      const currentState = {
        id: 'd1',
        label: 'Thermostat',
        getChannelByIndex: jest.fn((i) => (i === 1 ? {index: 1} : {index: 2})),
      };
      const updatedState = {id: 'd1', label: 'Thermostat', channels: [unchangedChannel, changedChannel]};
      deviceDb.instance.getById.mockReturnValue(currentState);
      DeviceStateBuilder.fromHomematicDevice.mockReturnValue(updatedState);

      deliver([new HMIPWSDeviceChangedEvent(device)]);

      expect(deviceSender.instance.sendData).toHaveBeenCalledTimes(1);
      expect(deviceSender.instance.sendData).toHaveBeenCalledWith(updatedState, 2);
      expect(EventLogger.wsDeviceUpdateDebug).toHaveBeenCalledTimes(1);
      expect(EventLogger.wsDeviceUpdateDebug).toHaveBeenCalledWith(currentState, updatedState, 2);
      // KNOWN BEHAVIOR: save() is unconditional, outside the per-channel diff check —
      // it runs even though channel 1 did not change.
      expect(deviceDb.instance.save).toHaveBeenCalledWith(updatedState);
    });

    it('falls back to DeviceStateBuilder.dummyState when no prior state exists on disk', () => {
      const device = new HMIPWSHeatingThermostatDevice({id: 'd1', label: 'Thermostat'});
      deviceDb.instance.getById.mockImplementation(() => {
        throw new Error('not found');
      });
      DeviceStateBuilder.dummyState.mockReturnValue({id: 'd1', label: 'INIT'});
      DeviceStateBuilder.fromHomematicDevice.mockReturnValue({id: 'd1', label: 'Thermostat', channels: []});

      deliver([new HMIPWSDeviceChangedEvent(device)]);

      expect(DeviceStateBuilder.dummyState).toHaveBeenCalledWith('d1');
    });
  });

  describe('handleHomeChangeEvent', () => {
    it('does nothing when the event carries no home payload', () => {
      deliver([new HMIPWSHomeChangedEvent(null)]);

      expect(weatherDb.instance.getById).not.toHaveBeenCalled();
    });

    it('keys the weather-state lookup by the first comma-segment of the city name', () => {
      const home = new HMIPWSHome({location: {city: 'Heidelsheim, Germany'}, weather: {}});
      const currentState = {label: 'Heidelsheim', equalsValueAttributes: jest.fn(() => true)};
      weatherDb.instance.getById.mockReturnValue(currentState);
      WeatherStateBuilder.fromHomematicHome.mockReturnValue({label: 'Heidelsheim'});

      deliver([new HMIPWSHomeChangedEvent(home)]);

      expect(weatherDb.instance.getById).toHaveBeenCalledWith('Heidelsheim');
    });

    it('sends to Influx, persists, and logs when the weather state changed', () => {
      const home = new HMIPWSHome({location: {city: 'Heidelsheim, Germany'}, weather: {}});
      const currentState = {label: 'Heidelsheim', equalsValueAttributes: jest.fn(() => false)};
      const updatedState = {label: 'Heidelsheim', temperature: 5};
      weatherDb.instance.getById.mockReturnValue(currentState);
      WeatherStateBuilder.fromHomematicHome.mockReturnValue(updatedState);

      deliver([new HMIPWSHomeChangedEvent(home)]);

      expect(weatherSender.instance.sendData).toHaveBeenCalledWith(currentState, updatedState);
      expect(weatherDb.instance.save).toHaveBeenCalledWith(updatedState);
      expect(EventLogger.weatherUpdateDebug).toHaveBeenCalledWith(currentState, updatedState);
    });

    it('falls back to WeatherStateBuilder.dummyState (no id argument) when no prior state exists', () => {
      const home = new HMIPWSHome({location: {city: 'Heidelsheim, Germany'}, weather: {}});
      weatherDb.instance.getById.mockImplementation(() => {
        throw new Error('not found');
      });
      WeatherStateBuilder.dummyState.mockReturnValue({label: 'INIT', equalsValueAttributes: () => true});
      WeatherStateBuilder.fromHomematicHome.mockReturnValue({label: 'Heidelsheim'});

      deliver([new HMIPWSHomeChangedEvent(home)]);

      expect(WeatherStateBuilder.dummyState).toHaveBeenCalledWith();
    });
  });

  describe('handleElement dispatch', () => {
    it('silently ignores an event of an unrecognized type', () => {
      deliver([{type: 'SOMETHING_ELSE'}]);

      expect(groupDb.instance.getById).not.toHaveBeenCalled();
      expect(deviceDb.instance.getById).not.toHaveBeenCalled();
      expect(weatherDb.instance.getById).not.toHaveBeenCalled();
    });
  });
});
