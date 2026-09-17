import {JsonFileDB} from './json-file.db';
import {WeatherState} from './model/weather-state';

const FILE_PATH = process.cwd() + '/persistent/states/weather.json';

export class WeatherStateDB extends JsonFileDB<WeatherState> {
    constructor() {
        super(FILE_PATH, WeatherState);
    }

    save(state: WeatherState): void {
        const shallowCopy = {...state};
        super.saveById(state.label, shallowCopy);
    }
}
