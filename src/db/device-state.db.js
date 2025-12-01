const {JsonFileDB} = require('./json-file.db');
const {DeviceState} = require("../homematic/device/device-state");

const FILE_PATH = process.cwd() + "/persistent/states/devices.json";

class DeviceStateDB extends JsonFileDB {

    constructor() {
        super(FILE_PATH);
    }

    /**
     * @param {DeviceState} state
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
        return Object.assign(new DeviceState(), rawData);
    }
}

module.exports = {DeviceStateDB};
