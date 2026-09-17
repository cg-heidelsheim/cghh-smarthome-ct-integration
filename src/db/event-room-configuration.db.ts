import {JsonFileDB} from './json-file.db';
import {EventRoomConfig} from './model/event-room-config.model';

const FILE_PATH = process.cwd() + '/config/event-room-temperature.config.json';

export class EventRoomConfigDB extends JsonFileDB<EventRoomConfig> {
    constructor() {
        super(FILE_PATH, EventRoomConfig);
    }
}
