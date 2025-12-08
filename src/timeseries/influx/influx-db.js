const {InfluxDB} = require('@influxdata/influxdb-client');
const {Point} = require('@influxdata/influxdb-client');
const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Berlin");

class InfluxDBManager {
    org = process.env.INFLUX_ORG;
    env = process.env.ENVIRONMENT;

    influx;

    constructor() {
        const influxUrl = RegExp(/^https?:\/\//).exec(process.env.INFLUX_HOST)
            ? process.env.INFLUX_HOST
            : `http://${process.env.INFLUX_HOST}:${process.env.INFLUX_PORT}`;

        this.influx = new InfluxDB({
            url: influxUrl,
            token: process.env.INFLUX_TOKEN
        });
    }

    sendLog(data, info = {}) {
        const point = new Point("Default Log");
        point.stringField("log", data.message);

        const writeApi = this.influx.getWriteApi(this.org, "logs");
        writeApi.useDefaultTags({environment: this.env, ...(data.tags ? data.tags : {})});

        if (Object.keys(info).length > 0) {
            point.stringField("info", JSON.stringify(info));
        }
        writeApi.writePoint(point);

        writeApi.close()
            .then(() => {
            })
            .catch((e) => {
                console.log("[INFLUX] [ERROR] " + e);
            });
    }

    sendGenericInformation(data, bucket) {
        const writeApi = this.influx.getWriteApi(this.org, bucket);

        writeApi.useDefaultTags({environment: this.env, ...(data.tags ? data.tags : {})});

        const point = new Point(data.label);

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

        writeApi.close()
            .then(() => {
            })
            .catch((e) => {
                console.log("[INFLUX] [ERROR] " + e);
            });
    }
}

module.exports = {InfluxDBManager};
