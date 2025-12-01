const {JsonFileDB} = require("./json-file.db");
const {GroupState} = require("../homematic/group/group-state");

const FILE_PATH = process.cwd() + "/persistent/states/groups.json";

class GroupStateDB extends JsonFileDB {

    constructor() {
        super(FILE_PATH);
    }

    /**
     * @param {GroupState} state
     * @returns {void}
     */
    save(state) {
        const shallowCopy = {...state};
        super.saveById(state.id, shallowCopy);
    }

    /**
     * @returns {DeviceState}
     */
    getById(id) {
        const rawData = super.getById(id);
        return Object.assign(new GroupState(), rawData);
    }
}

module.exports = {GroupStateDB};
