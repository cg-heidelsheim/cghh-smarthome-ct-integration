const {InfluxDB} = require('@influxdata/influxdb-client');
const {Point} = require('@influxdata/influxdb-client');
const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Berlin");
require('dotenv').config();

let logSeq = 0; // module-level counter

const writeOptions = {
    // tune as you like
    batchSize: 100,
    flushInterval: 5_000,
    maxRetries: 5,
    maxRetryTime: 180_000,

    // called when the client gives up on a batch
    writeFailed(error, lines, attempt, expires) {
        console.error({
            tags: {module: 'INFLUX', op: 'writeFailed'},
            message: `Write to InfluxDB failed after ${attempt} attempts: ${error.message}`,
        }, {
            errorStack: error.stack,
            attempt,
            expires,
            linesPreview: lines.slice(0, 5), // don't log all to avoid spam
        });
    },

    // optional: observe successful flushes
    writeSuccess(lines) {
        console.log({
            tags: {module: 'INFLUX', op: 'writeSuccess'},
            message: `Flushed ${lines.length} log lines to InfluxDB`,
        });
    },
};

class InfluxDBManager {
    org = process.env.INFLUX_ORG;
    env = process.env.ENVIRONMENT;

    influx;

    genericWriteApis = new Map(); // bucket -> writeApi

    constructor() {
        const influxUrl = RegExp(/^https?:\/\//).exec(process.env.INFLUX_HOST)
            ? process.env.INFLUX_HOST
            : `http://${process.env.INFLUX_HOST}:${process.env.INFLUX_PORT}`;

        this.influx = new InfluxDB({
            url: influxUrl,
            token: process.env.INFLUX_TOKEN
        });
    }

    getGenericWriteApi(bucket) {
        if (!this.genericWriteApis.has(bucket)) {
            const writeApi = this.influx.getWriteApi(
                this.org,
                bucket,
                "ns",
                writeOptions
            );
            writeApi.useDefaultTags({ environment: process.env.ENVIRONMENT });
            this.genericWriteApis.set(bucket, writeApi);
        }
        return this.genericWriteApis.get(bucket);
    }

    sendLog(data, info = {}) {
        const writeApi = this.getGenericWriteApi("logs");

        const point = new Point("Default Log");
        point.stringField("log", data.message);
        point.intField("seq", logSeq++);

        if (data.tags) {
            Object.entries(data.tags).forEach(([key, val]) => {
                // tags must be strings in Influx
                point.tag(key, String(val));
            });
        }

        if (Object.keys(info).length > 0) {
            point.stringField("info", JSON.stringify(info));
        }
        writeApi.writePoint(point);
    }

    sendGenericInformation(data, bucket) {
        const writeApi = this.getGenericWriteApi(bucket);

        const point = new Point(data.label);
        if (data.tags) {
            Object.entries(data.tags).forEach(([key, val]) => {
                // tags must be strings in Influx
                point.tag(key, String(val));
            });
        }

        if (data.timestamp) {
            point.timestamp(new Date(data.timestamp));
        }

        const dataValues = data.values;
        const dataValueKeys = Object.keys(dataValues);

        dataValueKeys
            .forEach(
                dataValueKey => {
                    const value = dataValues[dataValueKey];
                    if (value !== undefined && value !== null) {
                        point.floatField(dataValueKey, dataValues[dataValueKey]);
                    }
                }
            );

        writeApi.writePoint(point);
    }

    async flushAndClose() {
        try {
            for (const writeApi of this.genericWriteApis.values()) {
                await writeApi.flush();
                await writeApi.close();
            }
        } catch (e) {
            console.log("[INFLUX] [ERROR] flushing/closing", e);
        }
    }
}

module.exports = new InfluxDBManager();
