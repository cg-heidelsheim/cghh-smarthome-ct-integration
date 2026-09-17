import {DataSender} from './data-sender.base';
import {parseGroupStateIntoInfluxDataObject} from '../util/homematic-influx.mapper';
import type {GroupState} from '../db/model/group-state';

export class GroupDataSender extends DataSender {

    constructor() {
        super('groups');
    }

    parseData(state: GroupState) {
        return parseGroupStateIntoInfluxDataObject(state);
    }
}
