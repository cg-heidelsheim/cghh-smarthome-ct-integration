import influxDb from './influx/influx-db';
import type {InfluxDataPoint} from './influx/influx-data-point';

/**
 * Abstract base class for data senders.
 *
 * Implements common functionality for sending data to InfluxDB.
 * Subclasses must implement parseData and tag property.
 */
export class DataSender {

    bucket: string;

    constructor(bucket: string) {
        this.bucket = bucket;
        if (!this.bucket) {
            throw new Error("Subclass must define a 'bucket' property representing the target InfluxDB bucket.");
        }
    }

    /**
     * Parse the data into the InfluxDB data format.
     * This method must be overridden by subclasses.
     */
    parseData(..._args: unknown[]): InfluxDataPoint {
        throw new Error('parseData() must be implemented by subclass.');
    }

    /**
     * Send the parsed data to InfluxDB.
     */
    sendData(...args: unknown[]) {
        const influxData = this.parseData(...args);
        influxDb.sendGenericInformation(influxData, this.bucket);
    }
}
