jest.mock('../../src/timeseries/influx/influx-db', () => ({
    sendGenericInformation: jest.fn(),
    sendLog: jest.fn(),
    flushAndClose: jest.fn(),
}));
jest.mock('../../src/util/homematic-influx.mapper', () => ({
    parseDeviceStateChannelIntoInfluxDataObject: jest.fn(() => ({label: 'device', values: {}})),
    parseGroupStateIntoInfluxDataObject: jest.fn(() => ({label: 'group', values: {}})),
    parseWeatherStateIntoInfluxDataObject: jest.fn(() => ({label: 'weather', values: {}})),
}));

const {DeviceDataSender} = require('../../src/timeseries/device.data-sender');
const {GroupDataSender} = require('../../src/timeseries/group.data-sender');
const {WeatherDataSender} = require('../../src/timeseries/weather.data-sender');
const influxDb = require('../../src/timeseries/influx/influx-db');
const mapper = require('../../src/util/homematic-influx.mapper');

describe('data sender subclasses', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('DeviceDataSender binds the "devices" bucket and delegates parseData to the mapper for the matching channel', () => {
        const sender = new DeviceDataSender();
        expect(sender.bucket).toBe('devices');

        const channel = {index: 2, temperature: 21};
        const state = {label: 'Thermostat', channels: [{index: 1}, channel]};

        sender.sendData(state, 2);

        expect(mapper.parseDeviceStateChannelIntoInfluxDataObject).toHaveBeenCalledWith(state, channel);
        expect(influxDb.sendGenericInformation).toHaveBeenCalledWith({label: 'device', values: {}}, 'devices');
    });

    it('DeviceDataSender throws when the requested channel index does not exist', () => {
        const sender = new DeviceDataSender();
        const state = {label: 'Thermostat', channels: [{index: 1}]};

        expect(() => sender.sendData(state, 99)).toThrow(/Channel with index 99 not found/);
    });

    it('GroupDataSender binds the "groups" bucket and delegates parseData to the mapper', () => {
        const sender = new GroupDataSender();
        expect(sender.bucket).toBe('groups');

        const state = {label: 'Room A'};
        sender.sendData(state);

        expect(mapper.parseGroupStateIntoInfluxDataObject).toHaveBeenCalledWith(state);
        expect(influxDb.sendGenericInformation).toHaveBeenCalledWith({label: 'group', values: {}}, 'groups');
    });

    it('WeatherDataSender binds the "weather" bucket and delegates parseData to the mapper', () => {
        const sender = new WeatherDataSender();
        expect(sender.bucket).toBe('weather');

        const state = {label: 'Home'};
        sender.sendData(state);

        expect(mapper.parseWeatherStateIntoInfluxDataObject).toHaveBeenCalledWith(state);
        expect(influxDb.sendGenericInformation).toHaveBeenCalledWith({label: 'weather', values: {}}, 'weather');
    });
});
