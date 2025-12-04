const {JsonFileDB} = require('./json-file.db');
const {DeviceState} = require('./model/device-state');

const FILE_PATH = process.cwd() + "/persistent/states/devices.json";

class DeviceStateDB extends JsonFileDB {
    constructor() {
        super(FILE_PATH, DeviceState);
    }
}

module.exports = {DeviceStateDB};
