const {DataSender} = require('./data-sender.base');
const {parseGroupStateIntoInfluxDataObject} = require('../util/homematic-influx.mapper');

class GroupDataSender extends DataSender {

    constructor() {
        super('groups');
    }

    /**
     * @param args
     * @param {import('../db/model/group-state').GroupState}     args[0] currentState
     */
    parseData(...args) {
        const [state] = args;
        return parseGroupStateIntoInfluxDataObject(state);
    }
}

module.exports = {GroupDataSender};
