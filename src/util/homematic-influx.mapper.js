const {WeatherState} = require("../db/model/weather-state");
const {EventDataPoint} = require("../model/EventDataPoint");

/**
 * Take information of a {@link GroupState} and parse it into an influx usable DB object
 *
 * @param {GroupState} state
 *
 * @returns object
 */
const parseGroupStateIntoInfluxDataObject = (state) => {
    return {
        label: "sensoric",
        values: {
            temperature: state.temperature,
            setTemperature: state.setTemperature,
            humidity: state.humidity,
        },
        tags: {
            name: state.label.replace(/\s/g, "_"),
            type: "HEATING"
        }
    };
};

const parseDeviceStateChannelIntoInfluxDataObject = (state, channel) => {
    return {
        label: "sensoric",
        values: {
            temperature: channel.temperature,
            setTemperature: channel.setTemperature,
        },
        tags: {
            channel: channel.index,
            name: state.label.replace(/\s/g, "_"),
            type: "HEATING_THERMOSTAT"
        }
    };
};

const parseDeviceStateChannelIntoInfluxDataObjectState = (state, channel) => {
    return {
        label: "sensoric",
        values: {
            valvePosition: channel.valvePosition ? channel.valvePosition * 100 : 0
        },
        tags: {
            channel: channel.index,
            name: state.label.replace(/\s/g, "_"),
            type: "HEATING_THERMOSTAT"
        }
    };
};

/**
 * Take information of heating group and parse it into an influx parsable DB object
 *
 * @param {*} group
 * @returns
 */
const parseHeatingGroupDataIntoInfluxDataObject = (group) => {
    return {
        label: group.label,
        values: {
            temperature: group.actualTemperature,
            setTemperature: group.setPointTemperature,
            humidity: group.humidity,
        }
    };
};

/**
 * Take information of a {@link WeatherState} and parse it into an influx usable DB object
 *
 * @param {WeatherState} state
 *
 * @returns object
 */
const parseWeatherStateIntoInfluxDataObject = (state) => {
    const temperature = state.temperature;
    const minTemperature = state.minTemperature;
    const maxTemperature = state.maxTemperature;
    const windSpeed = state.windSpeed;
    const vaporAmount = state.vaporAmount;
    const humidity = state.humidity;

    return {
        label: state.label,
        values: {
            temperature,
            humidity,
            minTemperature,
            maxTemperature,
            windSpeed,
            vaporAmount
        },
        // tags: {
        //     weatherDayTime: state.weatherDayTime,
        //     weatherCondition: state.weatherCondition,
        //     tag: "ALL"
        // }
    };
};

/**
 * Take information of a {@link EventDataPoint} and parse it into an influx usable DB object
 *
 * @param {EventDataPoint} eventDataPoint
 *
 * @returns object
 */
const parseEventDataPointIntoInfluxDataObject = (eventDataPoint) => {
    return {
        label: "info",
        values: {
            isActive: eventDataPoint.isActive ? 1 : 0,
        },
        tags: {
            name: eventDataPoint.resourceName.replace(/\s/g, "_"),
            type: eventDataPoint.type
        },
        timestamp: eventDataPoint.timestamp
    };
};

module.exports = {
    parseGroupStateIntoInfluxDataObject,
    parseDeviceStateChannelIntoInfluxDataObject,
    parseDeviceStateChannelIntoInfluxDataObjectState,
    parseHeatingGroupDataIntoInfluxDataObject,
    parseWeatherStateIntoInfluxDataObject,
    parseEventDataPointIntoInfluxDataObject
};
