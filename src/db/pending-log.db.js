const {JsonFileDB} = require("./json-file.db");
const {PendingLog} = require("./model/pending-log");

const FILE_PATH = process.cwd() + "/persistent/pendingLogs.json";

class PendingLogDB extends JsonFileDB {

    constructor() {
        super(FILE_PATH);
    }

    /**
     * @param {PendingLog} pendingLog
     * @returns {void}
     */
    save(pendingLog) {
        const shallowCopy = {...pendingLog};
        super.saveById(pendingLog.id, shallowCopy)
    };

    /**
     * @param {string} id ID of HMIP group
     * @returns {PendingLog}
     */
    getById(id) {
        const rawData = super.getById(id);
        return Object.assign(new PendingLog(), rawData);
    };

    /**
     * @param {string} id ID of HMIP group
     * @returns {void}
     */
    deleteById(id) {
        super.deleteById(id);
    }
}

module.exports = {PendingLogDB};
