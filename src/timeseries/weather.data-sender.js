const {DataSender} = require('./data-sender.base');
const {parseWeatherStateIntoInfluxDataObject} = require('../util/homematic-influx.mapper');

class WeatherDataSender extends DataSender {
    constructor() {
        super('weather');
    }

    /**
     * @param args
     * @param {import('../db/model/weather-state').WeatherState}     args[0] state
     */
    parseData(...args) {
        const [state] = args;
        return parseWeatherStateIntoInfluxDataObject(state);
    }
}

module.exports = {WeatherDataSender};
