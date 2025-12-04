const {JsonFileDB} = require('./json-file.db.js');
const {RoomConfig} = require('./model/room-config');

const FILE_PATH = process.cwd() + "/config/room.config.json";

class RoomConfigDB extends JsonFileDB {
    constructor() {
        super(FILE_PATH, RoomConfig);
    }

    /**
     * Get entry by its ID field
     * @param id
     * @returns {RoomConfig}
     */
    getByCTId(id) {
        /** @type {RoomConfig[]} */
        const roomConfigs = this.getAll();
        const roomConfig = roomConfigs.find(roomConfig => roomConfig.id === id);

        if (!roomConfig) {
            throw new Error(`Resource with id ${id} does not exist as configuration`);
        }

        return roomConfig;
    }
}

module.exports = {RoomConfigDB};
