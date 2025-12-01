const {JsonFileDB} = require('../db/json-file.db.js');
const {RoomConfiguration} = require('./room-config');

const FILE_PATH = process.cwd() + "/config/room.config.json";

class RoomConfigurationDB extends JsonFileDB {

    constructor() {
        super(FILE_PATH);
    }

    /**
     * @returns {RoomConfiguration[]}
     */
    getAll() {
        let rooms = super.getAll();
        return rooms.map(roomRaw => Object.assign(new RoomConfiguration(), roomRaw));
    }

    /**
     * @param {string} id Key of the record to get. In this case CT room ID.
     * @returns {RoomConfiguration}
     */
    getById(id) {
        const rawData = super.getById(id);
        return Object.assign(new RoomConfiguration(), rawData);
    }
}

module.exports = {RoomConfigurationDB};
