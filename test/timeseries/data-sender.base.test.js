jest.mock('../../src/timeseries/influx/influx-db', () => ({
    sendGenericInformation: jest.fn(),
    sendLog: jest.fn(),
    flushAndClose: jest.fn(),
}));

const {DataSender} = require('../../src/timeseries/data-sender.base');
const influxDb = require('../../src/timeseries/influx/influx-db');

describe('DataSender (base)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('throws in the constructor when no bucket is provided', () => {
        expect(() => new DataSender()).toThrow(/must define a 'bucket'/);
        expect(() => new DataSender('')).toThrow(/must define a 'bucket'/);
    });

    it('stores the bucket name', () => {
        const sender = new DataSender('devices');
        expect(sender.bucket).toBe('devices');
    });

    it('parseData() throws by default (must be overridden by subclass)', () => {
        const sender = new DataSender('devices');
        expect(() => sender.parseData()).toThrow(/must be implemented by subclass/);
    });

    it('sendData() calls parseData then forwards the result + bucket to influxDb.sendGenericInformation', () => {
        class TestSender extends DataSender {
            constructor() {
                super('test-bucket');
            }

            parseData(...args) {
                return {label: 'x', values: {a: args[0]}};
            }
        }

        const sender = new TestSender();
        sender.sendData(42);

        expect(influxDb.sendGenericInformation).toHaveBeenCalledTimes(1);
        expect(influxDb.sendGenericInformation).toHaveBeenCalledWith(
            {label: 'x', values: {a: 42}},
            'test-bucket'
        );
    });
});
