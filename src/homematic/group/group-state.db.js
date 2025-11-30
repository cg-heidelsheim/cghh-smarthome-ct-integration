const { JsonFileDB } = require("../db/json-file.db");
const { GroupState } = require("./group-state");

const FILE_PATH = process.cwd() + "/persistent/states/groups.json";

class GroupStateDB extends JsonFileDB {

  constructor() {
    super(FILE_PATH);
  }

  getById(id) {
    const rawData = super.getById(id);
    const groupState = new GroupState();
    Object.assign(groupState, rawData);
    return groupState;
  }

  save(state) {
    const shallowCopy = { ...state };
    super.saveById(state.id, shallowCopy);
  }
}

module.exports = { GroupStateDB };
