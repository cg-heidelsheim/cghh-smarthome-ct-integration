// Fake Point: records every tag()/*Field() call so tests can assert on the
// shape written, without depending on the real @influxdata/influxdb-client
// Point implementation.
class FakePoint {
    constructor(name) {
        this.name = name;
        this.tags = {};
        this.fields = {};
    }

    tag(key, value) {
        this.tags[key] = value;
        return this;
    }

    stringField(key, value) {
        this.fields[key] = value;
        return this;
    }

    intField(key, value) {
        this.fields[key] = value;
        return this;
    }

    floatField(key, value) {
        this.fields[key] = value;
        return this;
    }
}

const writeApiMock = () => ({
    useDefaultTags: jest.fn(),
    writePoint: jest.fn(),
    flush: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
});

let getWriteApiMock;

jest.mock('@influxdata/influxdb-client', () => ({
    InfluxDB: jest.fn().mockImplementation(() => ({
        getWriteApi: (...args) => getWriteApiMock(...args),
    })),
    Point: jest.fn().mockImplementation((name) => new FakePoint(name)),
}));

process.env.INFLUX_HOST = 'influx.example.com';
process.env.INFLUX_PORT = '8086';
process.env.INFLUX_TOKEN = 'test-token';
process.env.INFLUX_ORG = 'test-org';
process.env.ENVIRONMENT = 'test';

const influxDb = require('../../../src/timeseries/influx/influx-db');

describe('InfluxDBManager (singleton export of influx-db.js)', () => {
    beforeEach(() => {
        getWriteApiMock = jest.fn(() => writeApiMock());
        influxDb.genericWriteApis.clear();
    });

    describe('getGenericWriteApi', () => {
        it('creates one write API per bucket and caches it', () => {
            const api1 = influxDb.getGenericWriteApi('groups');
            const api2 = influxDb.getGenericWriteApi('groups');

            expect(api1).toBe(api2);
            expect(getWriteApiMock).toHaveBeenCalledTimes(1);
        });

        it('creates separate write APIs for different buckets', () => {
            influxDb.getGenericWriteApi('groups');
            influxDb.getGenericWriteApi('devices');

            expect(getWriteApiMock).toHaveBeenCalledTimes(2);
        });
    });

    describe('sendGenericInformation', () => {
        it('writes a point with tags and only defined/non-null float fields', () => {
            const data = {
                label: 'Room A',
                tags: {module: 'WS', group: 'Room_A'},
                values: {temperature: 21.5, humidity: undefined, setTemperature: null, valvePosition: 0},
            };

            influxDb.sendGenericInformation(data, 'groups');

            const writeApi = influxDb.getGenericWriteApi('groups');
            const point = writeApi.writePoint.mock.calls[0][0];

            expect(point.name).toBe('Room A');
            expect(point.tags).toEqual({module: 'WS', group: 'Room_A'});
            expect(point.fields).toEqual({temperature: 21.5, valvePosition: 0});
        });
    });

    describe('sendLog', () => {
        it('writes a "Default Log" point with an incrementing seq field', () => {
            influxDb.sendLog({message: 'hello', tags: {level: 'INFO'}});
            influxDb.sendLog({message: 'world', tags: {level: 'INFO'}});

            const writeApi = influxDb.getGenericWriteApi('logs');
            const [firstCall, secondCall] = writeApi.writePoint.mock.calls;

            expect(firstCall[0].fields.log).toBe('hello');
            expect(secondCall[0].fields.log).toBe('world');
            expect(secondCall[0].fields.seq).toBeGreaterThan(firstCall[0].fields.seq);
        });

        it('stringifies non-empty `info` onto the point', () => {
            influxDb.sendLog({message: 'hello', tags: {}}, {foo: 'bar'});

            const writeApi = influxDb.getGenericWriteApi('logs');
            const point = writeApi.writePoint.mock.calls[0][0];
            expect(point.fields.info).toBe(JSON.stringify({foo: 'bar'}));
        });
    });

    describe('flushAndClose', () => {
        it('flushes and closes every cached write API', async () => {
            influxDb.getGenericWriteApi('groups');
            influxDb.getGenericWriteApi('devices');
            const groupsApi = influxDb.getGenericWriteApi('groups');
            const devicesApi = influxDb.getGenericWriteApi('devices');

            await influxDb.flushAndClose();

            expect(groupsApi.flush).toHaveBeenCalled();
            expect(groupsApi.close).toHaveBeenCalled();
            expect(devicesApi.flush).toHaveBeenCalled();
            expect(devicesApi.close).toHaveBeenCalled();
        });

        it('does not throw if a write API fails to flush', async () => {
            const failingApi = writeApiMock();
            failingApi.flush.mockRejectedValue(new Error('flush failed'));
            getWriteApiMock = jest.fn(() => failingApi);
            influxDb.getGenericWriteApi('groups');

            await expect(influxDb.flushAndClose()).resolves.toBeUndefined();
        });
    });
});
