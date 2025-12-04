const {JsonFileDB} = require("./json-file.db");
const {WeatherState} = require("./model/weather-state");

const FILE_PATH = process.cwd() + "/persistent/states/weather.json";

class WeatherStateDB extends JsonFileDB {
    constructor() {
        super(FILE_PATH, WeatherState);
    }

    /**
     * @param {WeatherState} state
     */
    save(state) {
        const shallowCopy = {...state};
        super.saveById(state.label, shallowCopy);
    }
}

module.exports = {WeatherStateDB};
