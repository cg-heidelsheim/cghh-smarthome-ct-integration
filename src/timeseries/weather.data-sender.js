const {DataSender} = require("./data-sender.base");
const {WeatherState} = require("../db/model/weather-state");
const {parseWeatherStateIntoInfluxDataObject} = require("../util/homematic-influx.mapper");

class WeatherDataSender extends DataSender {
    constructor() {
        super("weather");
    }

    /**
     * @param args
     * @param {WeatherState}     args[0] state
     */
    parseData(...args) {
        const [state] = args;
        return parseWeatherStateIntoInfluxDataObject(state);
    }
}

module.exports = {WeatherDataSender};
