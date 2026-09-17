const fs = require('fs');
const fse = require('fs-extra');
import {Logger} from '../util/logger';

type ModelCtor<T> = new () => T;

/**
 * Generic JSON file database base class for simple key-value storage.
 * Manages a JSON file storing objects keyed by ids.
 * Handles file existence, reading, writing, and error management.
 */
export class JsonFileDB<T extends object> {
    filePath: string;
    ModelClass: ModelCtor<T> | null;

    /**
     * Creates a JsonFileDB instance associated with a JSON file.
     * Ensures the file exists on disk, creates empty JSON if missing.
     *
     * @param filePath Absolute path to the JSON file to use.
     * @param ModelClass JS Class that an entry is converted into
     */
    constructor(filePath: string, ModelClass: ModelCtor<T> | null = null) {
        this.filePath = filePath;
        this.ModelClass = ModelClass;
        this.ensureFileExists();
    }

    /**
     * Reads and parses the JSON file contents.
     * Throws an error if file read or JSON parse fails.
     *
     * @throws Error If unable to read or parse the file.
     */
    _readFile(): Record<string, unknown> {
        try {
            const raw = fs.readFileSync(this.filePath, 'utf8');
            return raw ? JSON.parse(raw) : {};
        } catch (err) {
            throw new Error(`Failed to read or parse DB file ${this.filePath}: ${(err as Error).message}`);
        }
    }

    /**
     * Ensures the JSON file exists. Creates empty JSON if not.
     */
    ensureFileExists(): void {
        if (!fs.existsSync(this.filePath)) {
            fse.outputFileSync(this.filePath, JSON.stringify({}, null, 2));
            // TODO(ts-migration): was `tags: ['json-file-db']` (an array) - TS caught that
            // this doesn't match Logger's Record<string,unknown> tags shape used everywhere
            // else. An array here also silently drops the `level` tag JSON.stringify adds in
            // Logger.log (arrays ignore non-index properties), so this wasn't just a type
            // mismatch, it was already a minor logging bug. No test covers this exact call.
            Logger.info({tags: {source: 'json-file-db'}, message: `Created new DB file at ${this.filePath}`});
        }
    }

    /**
     * Saves or updates a record by its "id" field in the JSON file.
     * On file read error, starts fresh with empty data.
     */
    save(state: T & {id: string}): void {
        this.saveById(state.id, state);
    }

    /**
     * Saves or updates a record by id in the JSON file.
     * On file read error, starts fresh with empty data.
     */
    saveById(id: string, data: unknown): void {
        let allData: Record<string, unknown>;
        try {
            allData = this._readFile();
        } catch (err) {
            // TODO(ts-migration): see the matching note in ensureFileExists() above -
            // was `tags: ['json-file-db']`, changed to an object to match Logger's shape.
            Logger.warn({
                tags: {source: 'json-file-db'}, message: `Loading DB file failed: ${(err as Error).message}. Starting fresh.`,
            });
            allData = {};
        }
        allData[id] = data;
        fse.outputFileSync(this.filePath, JSON.stringify(allData, null, 2));
    }

    /**
     * Deletes a record by id in the JSON file.
     */
    deleteById(id: string): void {
        const allData = this._readFile();
        delete allData[id];

        fse.outputFileSync(this.filePath, JSON.stringify(allData, null, 2));
    }

    /**
     * Wraps a raw stored record in `this.ModelClass`, if one was configured.
     */
    #toModel(data: unknown): T {
        if (this.ModelClass) {
            return Object.assign(new this.ModelClass(), data);
        }
        return data as T;
    }

    /**
     * Retrieves a record by id from the JSON file.
     * Throws error if no record found.
     *
     * @throws Error When record does not exist.
     */
    getById(id: string): T {
        const data = this.tryGetById(id);
        if (!data) {
            throw new Error(`Entry with id "${id}" not found in "${this.ModelClass!.name}" DB.`);
        }
        return data;
    }

    /**
     * Retrieves a record by id from the JSON file, or `null` if it doesn't exist.
     * Unlike `getById`, "not found" is a normal return value rather than a thrown
     * error, so callers don't need exception-as-control-flow to check for absence.
     * A real read/parse failure (a corrupt DB file) still throws, since that's a
     * different failure mode than "not found" and callers should handle it distinctly.
     */
    tryGetById(id: string): T | null {
        const allData = this._readFile();
        const data = allData[id];
        if (!data) {return null;}
        return this.#toModel(data);
    }

    /**
     * Retrieves a record by arbitrary attribute value from the JSON file.
     * The attribute name is passed as attributeName, and the exact match is searched.
     * Returns the first matching record found, or throws if none found.
     *
     * @throws Error When no matching record is found.
     */
    findByAttribute(attributeName: string, value: unknown): T {
        const found = this.tryFindByAttribute(attributeName, value);
        if (!found) {
            throw new Error(`Entry with ${attributeName} = ${value} not found in DB.`);
        }
        return found;
    }

    /**
     * Same as `findByAttribute`, but returns `null` instead of throwing when no
     * matching record is found. See `tryGetById` for why this distinction matters.
     */
    tryFindByAttribute(attributeName: string, value: unknown): T | null {
        const allData = this._readFile();
        const allEntries = Object.values(allData) as Record<string, unknown>[];
        const found = allEntries.find(entry => entry[attributeName] === value);
        if (!found) {return null;}
        return this.#toModel(found);
    }

    /**
     * Returns all stored objects as an array.
     * The underlying JSON is assumed to be a key-value object
     * where each value is a stored record.
     */
    getAll(): T[] {
        const allData = this._readFile();

        if (this.ModelClass) {
            const Model = this.ModelClass;
            return Object.values(allData).map((data) => {
                return Object.assign(new Model(), data);
            });
        }

        return Object.values(allData) as T[];
    }
}
