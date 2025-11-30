const { JsonFileDB } = require('../db/json-file.db');
const FILE_PATH = process.cwd() + "/persistent/states/devices.json";

class DeviceStateDB extends JsonFileDB {

  constructor() {
    super(FILE_PATH);
  }

  save(state) {
    const shallowCopy = {... state};
    super.saveById(state.id, shallowCopy);
  }

  getById(id) {
    return super.getById(id);
  }
}

module.exports = { DeviceStateDB };
