const fs = require("fs");
const fse = require("fs-extra");

const FILE_PATH = process.cwd() + "/persistent/states/devices.json";

/**
 * Manages persistent storage and retrieval of DeviceState objects
 * as JSON data serialized on disk.
 */
class DeviceStateDB {

  constructor() {
    // Ensure file existence, create empty JSON object file if missing
    if (!fs.existsSync(FILE_PATH)) {
      fse.outputFileSync(FILE_PATH, JSON.stringify({}, null, 2));
      console.log(`Created new device state storage file at ${FILE_PATH}`);
    }
  }

  /**
   * Saves or updates a DeviceState in persistent storage.
   * 
   * @param {DeviceState} state - The DeviceState object to save.
   */
  save(state) {
    let allDeviceStates;

    try {
      allDeviceStates = this._readFile();
    } catch (error) {
      console.warn("No device state could be loaded from disk: " + error);
      allDeviceStates = {};
    }

    // Store required properties only
    allDeviceStates[state.id] = {...state};

    fse.outputFileSync(FILE_PATH, JSON.stringify(allDeviceStates, null, 2));
  }

  /**
   * Reads and parses the device states JSON file from disk.
   * Throws an error if reading or parsing fails.
   *
   * @returns {Object} Parsed JSON object containing device states.
   * @throws {Error} When file read or parse fails
   */
  _readFile() {
    try {
      const rawData = fs.readFileSync(FILE_PATH, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      throw new Error(`Failed to read or parse device state file: ${error.message}`);
    }
  }
}

module.exports = { DeviceStateDB };
