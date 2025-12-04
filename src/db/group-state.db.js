const {JsonFileDB} = require("./json-file.db");
const {GroupState} = require("./model/group-state");

const FILE_PATH = process.cwd() + "/persistent/states/groups.json";

class GroupStateDB extends JsonFileDB {

    constructor() {
        super(FILE_PATH, GroupState);
    }
}

module.exports = {GroupStateDB};
