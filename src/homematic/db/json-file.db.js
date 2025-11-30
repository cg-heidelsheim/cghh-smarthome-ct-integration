const fs = require('fs');
const fse = require('fs-extra');

/**
 * Generic JSON file database base class for simple key-value storage.
 * Manages a JSON file storing objects keyed by ids.
 * Handles file existence, reading, writing, and error management.
 */
  class JsonFileDB {
  /**
   * Creates a JsonFileDB instance associated with a JSON file.
   * Ensures the file exists on disk, creates empty JSON if missing.
   * 
   * @param {string} filePath Absolute path to the JSON file to use.
   * @param {Object} [options] Optional settings for the DB instance.
   * @param {Object} [options.logger=console] Logger instance to use for messages.
   */
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.logger = options.logger || console;
    this.ensureFileExists();
  }

  /**
   * Ensures the JSON file exists. If missing, creates an empty JSON object file.
   */
  ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      fse.outputFileSync(this.filePath, JSON.stringify({}, null, 2));
      this.logger.log(`Created new DB file at ${this.filePath}`);
    }
  }

  /**
   * Reads and parses the JSON file contents.
   * Throws an error if file read or JSON parse fails.
   * 
   * @returns {Object} Parsed JSON contents of the DB file.
   * @throws {Error} If unable to read or parse the file.
   */
  _readFile() {
    try {
      const rawData = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      throw new Error(`Failed to read or parse DB file ${this.filePath}: ${error.message}`);
    }
  }

  /**
   * Saves or updates a record by id in the JSON file.
   * On file read error, starts fresh with empty data.
   * 
   * @param {string} id Key for the record.
   * @param {*} data The data object to save.
   */
  saveById(id, data) {
    let allData;
    try {
      allData = this._readFile();
    } catch (error) {
      this.logger.warn(`Loading DB file failed: ${error.message}. Starting fresh.`);
      allData = {};
    }
    allData[id] = data;
    fse.outputFileSync(this.filePath, JSON.stringify(allData, null, 2));
  }

  /**
   * Retrieves a record by id from the JSON file.
   * Throws error if no record found.
   * 
   * @param {string} id Key of the record to get.
   * @returns {*} The data object stored under the id.
   * @throws {Error} When record does not exist.
   */
  getById(id) {
    const allData = this._readFile();
    const data = allData[id];
    if (!data) {
      throw new Error(`Entry with id ${id} not found in DB.`);
    }
    return data;
  }
}

module.exports = { JsonFileDB };
