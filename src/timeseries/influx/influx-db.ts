import {InfluxDB, Point, type WriteApi} from '@influxdata/influxdb-client';
import '../../util/timezone.bootstrap';

require('dotenv').config();

let logSeq = 0; // module-level counter

interface InfluxDataPoint {
    label: string;
    values: Record<string, number | undefined | null>;
    tags?: Record<string, unknown>;
}

const writeOptions = {
    // tune as you like
    batchSize: 100,
    flushInterval: 5_000,
    maxRetries: 5,
    maxRetryTime: 180_000,

    // Called when the client gives up on a batch. The real @influxdata/influxdb-client
    // WriteFailedFn signature is (error, lines, attempts) - only 3 args. The pre-migration
    // JS code declared a 4th `expires` parameter that the library never actually passes,
    // so it always logged as undefined; removed now that real types caught it.
    writeFailed(error: Error, lines: string[], attempt: number) {
        console.error({
            tags: {module: 'INFLUX', op: 'writeFailed'},
            message: `Write to InfluxDB failed after ${attempt} attempts: ${error.message}`,
        }, {
            errorStack: error.stack,
            attempt,
            linesPreview: lines.slice(0, 5), // don't log all to avoid spam
        });
    },

    // optional: observe successful flushes
    writeSuccess(lines: string[]) {
        console.log({
            tags: {module: 'INFLUX', op: 'writeSuccess'},
            message: `Flushed ${lines.length} log lines to InfluxDB`,
        });
    },
};

class InfluxDBManager {
    // Required deployment configuration, trusted to be set (consistent with the rest of
    // this codebase's treatment of process.env.*) - `!` documents that rather than
    // threading an `| undefined` through every write call.
    org = process.env.INFLUX_ORG!;
    env = process.env.ENVIRONMENT;

    influx;

    genericWriteApis = new Map<string, WriteApi>();

    constructor() {
        const influxUrl = process.env.INFLUX_HOST && RegExp(/^https?:\/\//).exec(process.env.INFLUX_HOST)
            ? process.env.INFLUX_HOST
            : `http://${process.env.INFLUX_HOST}:${process.env.INFLUX_PORT}`;

        this.influx = new InfluxDB({
            url: influxUrl,
            token: process.env.INFLUX_TOKEN
        });
    }

    getGenericWriteApi(bucket: string): WriteApi {
        if (!this.genericWriteApis.has(bucket)) {
            const writeApi = this.influx.getWriteApi(
                this.org,
                bucket,
                'ns',
                writeOptions
            );
            writeApi.useDefaultTags({environment: this.env ?? 'unknown'});
            this.genericWriteApis.set(bucket, writeApi);
        }
        return this.genericWriteApis.get(bucket) as WriteApi;
    }

    sendLog(data: {tags?: Record<string, unknown>; message: string}, info: Record<string, unknown> = {}) {
        const writeApi = this.getGenericWriteApi('logs');

        const point = new Point('Default Log');
        point.stringField('log', data.message);
        point.intField('seq', logSeq++);

        if (data.tags) {
            Object.entries(data.tags).forEach(([key, val]) => {
                // tags must be strings in Influx
                point.tag(key, String(val));
            });
        }

        if (Object.keys(info).length > 0) {
            point.stringField('info', JSON.stringify(info));
        }
        writeApi.writePoint(point);
    }

    sendGenericInformation(data: InfluxDataPoint, bucket: string) {
        const writeApi = this.getGenericWriteApi(bucket);

        const point = new Point(data.label);
        if (data.tags) {
            Object.entries(data.tags).forEach(([key, val]) => {
                // tags must be strings in Influx
                point.tag(key, String(val));
            });
        }

        const dataValues = data.values;
        const dataValueKeys = Object.keys(dataValues);

        dataValueKeys
            .forEach(
                dataValueKey => {
                    const value = dataValues[dataValueKey];
                    if (value !== undefined && value !== null) {
                        point.floatField(dataValueKey, value);
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
            console.log('[INFLUX] [ERROR] flushing/closing', e);
        }
    }
}

export = new InfluxDBManager();
