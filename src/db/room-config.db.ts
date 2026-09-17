import {JsonFileDB} from './json-file.db';
import {RoomConfig} from './model/room-config';

const FILE_PATH = process.cwd() + '/config/room.config.json';

export class RoomConfigDB extends JsonFileDB<RoomConfig> {
    constructor() {
        super(FILE_PATH, RoomConfig);
    }

    /**
     * Get entry by its ID field
     */
    findByCTId(id: string): RoomConfig {
        return this.findByAttribute('id', id);
    }
}
