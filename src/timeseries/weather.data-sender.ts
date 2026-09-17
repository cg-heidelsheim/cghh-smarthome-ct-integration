import {DataSender} from './data-sender.base';
import {parseWeatherStateIntoInfluxDataObject} from '../util/homematic-influx.mapper';
import type {WeatherState} from '../db/model/weather-state';

export class WeatherDataSender extends DataSender {
    constructor() {
        super('weather');
    }

    parseData(state: WeatherState) {
        return parseWeatherStateIntoInfluxDataObject(state);
    }
}
