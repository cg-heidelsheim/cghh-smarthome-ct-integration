const path = require('path');
const {JsonFileDB} = require('./json-file.db.js');
const {EventRoomConfig} = require('../db/model/event-room-config.model.js');

const FILE_PATH = path.join(process.cwd(), 'config', 'event-room-temperature.config.json');

class EventRoomConfigDB extends JsonFileDB {
  constructor() {
    super(FILE_PATH, EventRoomConfig);
  }
}

module.exports = { EventRoomConfigDB };
