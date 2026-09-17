import {JsonFileDB} from './json-file.db';
import {PendingLog} from './model/pending-log';

const FILE_PATH = process.cwd() + '/persistent/pendingLogs.json';

export class PendingLogDB extends JsonFileDB<PendingLog> {

    constructor() {
        super(FILE_PATH, PendingLog);
    }
}
