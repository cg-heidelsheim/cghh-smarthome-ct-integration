const fs = require("fs");
const fse = require("fs-extra");
const { GroupState } = require("./group-state");
const {Logger} = require("../../util/logger");

const FILE_PATH = process.cwd() + "/persistent/states/groups.json";

/**
 * Manages persistent storage and retrieval of GroupState objects
 * as JSON data serialized on disk.
 */
class GroupStateDB {

  constructor() {
    // Ensure file existence, create empty JSON object file if missing
    if (!fs.existsSync(FILE_PATH)) {
      fse.outputFileSync(FILE_PATH, JSON.stringify({}, null, 2));
      console.log(`Created new group state storage file at ${FILE_PATH}`);
    }
  }

  /**
   * Retrieves a stored GroupState object by its id.
   * 
   * @param {string} groupId - Unique identifier of the group state to retrieve.
   * @returns {GroupState} - The GroupState instance with matching id.
   * @throws {Error} - Throws if no group state found for the given id.
   */
  getById(groupId) {
    let allGroupStates;

    try {
      allGroupStates = this._readFile();
    } catch (error) {
      Logger.warning({ message: "No group state could be loaded from disk: " + error });
      allGroupStates = {};
    }

    const groupStateRaw = allGroupStates[groupId];
    if (!groupStateRaw) {
      throw new Error(`GroupState with id '${groupId}' not found`);
    }

    // Rehydrate raw data into GroupState instance
    const groupState = new GroupState();
    Object.assign(groupState, groupStateRaw);

    return groupState;
  }

  /**
   * Saves or updates a GroupState in persistent storage.
   * 
   * @param {GroupState} state - The GroupState object to save.
   */
  save(state) {
    let allGroupStates;

    try {
      allGroupStates = this._readFile();
    } catch (error) {
      Logger.warning({ message: "No group state could be loaded from disk: " + error });
      allGroupStates = {};
    }

    // Store shallow copy of state properties (shallow clone)
    allGroupStates[state.id] = { ...state };

    fse.outputFileSync(FILE_PATH, JSON.stringify(allGroupStates, null, 2));
  }

  /**
   * Reads the contents of the storage file and parses it as JSON.
   * Throws an error if file reading or parsing fails.
   * 
   * @returns {Object} Parsed JSON object containing all stored group states.
   * @throws {Error} When failing to read or parse the file
   */
  _readFile() {
    try {
      const rawData = fs.readFileSync(FILE_PATH, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      throw new Error(`Failed to read or parse group state file: ${error.message}`);
    }
  }
}

module.exports = { GroupStateDB };
