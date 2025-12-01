const {JsonFileDB} = require("./json-file.db");
const {WeatherState} = require("../homematic/weather/weather-state");

const FILE_PATH = process.cwd() + "/persistent/states/weather.json";

class WeatherStateDB extends JsonFileDB {

    constructor() {
        super(FILE_PATH);
    }

    /**
     * @param {WeatherState} state
     * @returns {void}
     */
    save(state) {
        const shallowCopy = {...state};
        super.saveById(state.id, shallowCopy);
    }

    /**
     * @returns {WeatherState}
     */
    getById(id) {
        const rawData = super.getById(id);
        return Object.assign(new WeatherState(), rawData);
    }
}

module.exports = {WeatherStateDB};
