const fs = require('fs');
const fse = require('fs-extra');
const {Logger} = require('../util/logger.js');


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
     * @param ModelClass JS Class that en entry is converted into
     */
    constructor(filePath, ModelClass = null) {
        this.filePath = filePath;
        this.ModelClass = ModelClass;
        this.ensureFileExists();
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
            const raw = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(raw);
        } catch (err) {
            throw new Error(`Failed to read or parse DB file ${this.filePath}: ${err.message}`);
        }
    }

    /**
     * Ensures the JSON file exists. Creates empty JSON if not.
     */
    ensureFileExists() {
        if (!fs.existsSync(this.filePath)) {
            fse.outputFileSync(this.filePath, JSON.stringify({}, null, 2));
            Logger.info({tags: ['json-file-db'], message: `Created new DB file at ${this.filePath}`});
        }
    }

    /**
     * Saves or updates a record by its "id" field in the JSON file.
     * On file read error, starts fresh with empty data.
     *
     * @param {any} state The data object to save.
     */
    save(state) {
        this.saveById(state.id, state);
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
        } catch (err) {
            Logger.warn({
                tags: ['json-file-db'], message: `Loading DB file failed: ${err.message}. Starting fresh.`,
            });
            allData = {};
        }
        allData[id] = data;
        fse.outputFileSync(this.filePath, JSON.stringify(allData, null, 2));
    }

    /**
     * Deletes a record by id in the JSON file.
     *
     * @param {string} id Key for the record.
     */
    deleteById(id) {
        let allData = this._readFile();
        delete allData[id];

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
            throw new Error(`Entry with id "${id}" not found in "${this.ModelClass.name}" DB.`);
        }

        if (this.ModelClass) {
            return Object.assign(new this.ModelClass(), data);
        }

        return data;
    }

    /**
     * Retrieves a record by arbitrary attribute value from the JSON file.
     * The attribute name is passed as attributeName, and the exact match is searched.
     * Returns the first matching record found, or throws if none found.
     *
     * @param {string} attributeName The attribute key to search by (e.g. 'id' or 'homematicId').
     * @param {any} value The exact value to look for in the attribute.
     * @returns {any} The first matching data object found.
     * @throws {Error} When no matching record is found.
     */
    findByAttribute(attributeName, value) {
        const allData = this._readFile();
        const allEntries = Object.values(allData);
        const found = allEntries.find(entry => entry[attributeName] === value);
        if (!found) {
            throw new Error(`Entry with ${attributeName} = ${value} not found in DB.`);
        }

        if (this.ModelClass) {
            return Object.assign(new this.ModelClass(), found);
        }

        return found;
    }

    /**
     * Returns all stored objects as an array.
     * The underlying JSON is assumed to be a key-value object
     * where each value is a stored record.
     *
     * @returns {Array} Array of stored data objects.
     */
    getAll() {
        const allData = this._readFile();

        if (this.ModelClass) {
            const Model = this.ModelClass;
            return Object.values(allData).map((data) => {
                return Object.assign(new Model(), data);
            });
        }


        return Object.values(allData);
    }
}

module.exports = {JsonFileDB};
