const {WeatherState} = require("../db/model/weather-state");

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

module.exports = {
    parseGroupStateIntoInfluxDataObject,
    parseDeviceStateChannelIntoInfluxDataObject,
    parseHeatingGroupDataIntoInfluxDataObject,
    parseWeatherStateIntoInfluxDataObject
};