const {JsonFileDB} = require("./json-file.db");
const {PendingLog} = require("./model/pending-log");

const FILE_PATH = process.cwd() + "/persistent/pendingLogs.json";

class PendingLogDB extends JsonFileDB {

    constructor() {
        super(FILE_PATH, PendingLog);
    }
}

module.exports = {PendingLogDB};
