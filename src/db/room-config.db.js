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
    findByCTId(id) {
        return this.findByAttribute('id', id);
    }
}

module.exports = {RoomConfigDB};
