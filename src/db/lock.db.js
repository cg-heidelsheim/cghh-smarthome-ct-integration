const {JsonFileDB} = require("./json-file.db");
const {Lock} = require("./model/lock");
const {RoomConfiguration} = require("./model/room-config");

const FILE_PATH = process.cwd() + "/persistent/locks.json";

class LockDB extends JsonFileDB {

    constructor() {
        super(FILE_PATH);
    }

    /**
     * @returns {Lock[]}
     */
    getAll() {
        let locks = super.getAll();
        return locks.map(roomRaw => Object.assign(new Lock(), roomRaw));
    }

    /**
     * @param {string} id Key of the record to get. In this case HMIP group ID.
     * @returns {Lock}
     */
    getById(id) {
        const rawData = super.getById(id);
        return Object.assign(new Lock(), rawData);
    }

    /**
     * @param {Lock} lock
     * @returns {void}
     */
    save(lock) {
        const shallowCopy = {...lock};
        super.saveById(lock.id, shallowCopy);
    }

    /**
     * @param {string} id HMIP group id of the lock
     */
    deleteById(id) {
        super.deleteById(id);
    }
}

module.exports = {LockDB};