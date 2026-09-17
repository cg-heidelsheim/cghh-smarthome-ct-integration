import {JsonFileDB} from './json-file.db';
import {GroupState} from './model/group-state';

const FILE_PATH = process.cwd() + '/persistent/states/groups.json';

export class GroupStateDB extends JsonFileDB<GroupState> {

    constructor() {
        super(FILE_PATH, GroupState);
    }
}
