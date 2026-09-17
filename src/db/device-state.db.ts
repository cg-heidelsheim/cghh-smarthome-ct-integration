import {JsonFileDB} from './json-file.db';
import {DeviceState} from './model/device-state';

const FILE_PATH = process.cwd() + '/persistent/states/devices.json';

export class DeviceStateDB extends JsonFileDB<DeviceState> {
    constructor() {
        super(FILE_PATH, DeviceState);
    }
}
