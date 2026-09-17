const {JsonFileDB} = require('./json-file.db');
const {EventRoomConfig} = require('../db/model/event-room-config.model');

const FILE_PATH = process.cwd() + '/config/event-room-temperature.config.json';

class EventRoomConfigDB extends JsonFileDB {
    constructor() {
        super(FILE_PATH, EventRoomConfig);
    }
}

module.exports = {EventRoomConfigDB};
