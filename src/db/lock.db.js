const {JsonFileDB} = require("./json-file.db");
const {Lock} = require("./model/lock");

const FILE_PATH = process.cwd() + "/persistent/locks.json";

class LockDB extends JsonFileDB {
    constructor() {
        super(FILE_PATH, Lock);
    }
}

module.exports = {LockDB};
