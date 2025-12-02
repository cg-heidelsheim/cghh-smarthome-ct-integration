const {JsonFileDB} = require('./json-file.db.js');
const {RoomConfig} = require('./model/room-config');

const FILE_PATH = process.cwd() + "/config/room.config.json";

class RoomConfigDB extends JsonFileDB {

    constructor() {
        super(FILE_PATH);
    }

    /**
     * @returns {RoomConfig[]}
     */
    getAll() {
        let rooms = super.getAll();
        return rooms.map(roomRaw => Object.assign(new RoomConfig(), roomRaw));
    }

    /**
     * @param {string} id Key of the record to get. Uses HMIP id.
     * @returns {RoomConfig}
     */
    getById(id) {
        const rawData = super.getById(id);
        return Object.assign(new RoomConfig(), rawData);
    }

    /**
     * @param {string} id Key of the record to get. Uses CT.
     * @returns {RoomConfig}
     */
    getByCTId(id) {
        const roomConfigs = this.getAll();
        const roomConfig = roomConfigs.find(roomConfig => roomConfig.id === id);

        if (!roomConfig) {
            throw new Error(`Resource with id ${booking.resource_id} does not exist as configuration`)
        }

        return roomConfig;
    }
}

module.exports = {RoomConfigDB};
