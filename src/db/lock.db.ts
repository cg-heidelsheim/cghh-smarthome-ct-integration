import {JsonFileDB} from './json-file.db';
import {Lock} from './model/lock';

const FILE_PATH = process.cwd() + '/persistent/locks.json';

export class LockDB extends JsonFileDB<Lock> {

    constructor() {
        super(FILE_PATH, Lock);
    }
}
