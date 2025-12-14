const influxDb = require('../timeseries/influx/influx-db'); // now the singleton

/**
 * Abstract base class for data senders.
 *
 * Implements common functionality for sending data to InfluxDB.
 * Subclasses must implement parseData and tag property.
 */
class DataSender {

    bucket;

    constructor(bucket) {
        this.bucket = bucket;
        if (!this.bucket) {
            throw new Error("Subclass must define a 'bucket' property representing the target InfluxDB bucket.");
        }
    }

    /**
     * Parse the data into the InfluxDB data format.
     * This method must be overridden by subclasses.
     *
     * @param  {...any} args - Arguments needed for parsing
     * @returns {Object} Data formatted for InfluxDB
     */
    parseData(...args) {
        throw new Error("parseData() must be implemented by subclass.");
        return {};
    }

    /**
     * Send the parsed data to InfluxDB.
     *
     * @param  {...any} args - Arguments needed for parseData
     */
    sendData(...args) {
        const influxData = this.parseData(...args);
        influxDb.sendGenericInformation(influxData, this.bucket);
    }
}

module.exports = {DataSender};
