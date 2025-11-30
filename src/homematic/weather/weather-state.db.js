const fs = require("fs");
const fse = require("fs-extra");

const {Logger} = require("../../util/logger");

const FILE_PATH = process.cwd() + "/persistent/states/weather.json";

/**
 * Manages persistent storage and retrieval of WeatherState objects
 * as JSON data serialized on disk.
 */
class WeatherStateDB {

  constructor() {
    // Ensure file existence, create empty JSON object file if missing
    if (!fs.existsSync(FILE_PATH)) {
      fse.outputFileSync(FILE_PATH, JSON.stringify({}, null, 2));
      console.log(`Created new weather state storage file at ${FILE_PATH}`);
    }
  }

  /**
   * Saves or updates a WeatherState in persistent storage.
   * 
   * @param {WeatherState} state - WeatherState object to save.
   */
  save(state) {
    let allWeatherStates;

    try {
      allWeatherStates = this._readFile();
    } catch (error) {
      Logger.warning({ message: "No weather state could be loaded from disk: " + error });
      allWeatherStates = {};
    }

    allWeatherStates[state.id] = {...state};

    fse.outputFileSync(FILE_PATH, JSON.stringify(allWeatherStates, null, 2));
  }

  /**
   * Reads and parses the weather state JSON file.
   * Throws an error if reading or parsing fails.
   * 
   * @returns {Object} Parsed JSON object of all saved weather states.
   * @throws {Error} When file cannot be read or parsed.
   */
  _readFile() {
    try {
      const rawData = fs.readFileSync(FILE_PATH, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      throw new Error(`Failed to read or parse weather state file: ${error.message}`);
    }
  }
}

module.exports = { WeatherStateDB };
