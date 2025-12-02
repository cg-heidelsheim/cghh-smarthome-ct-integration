const {DataSender} = require("./data-sender.base");
const {GroupState} = require("../db/model/group-state");
const {parseGroupStateIntoInfluxDataObject} = require("../util/homematic-influx.mapper");

class GroupDataSender extends DataSender {

    bucket = "groups";

    /**
     * @param args
     * @param {GroupState}     args[0] currentState
     */
    parseData(...args) {
        const [state] = args;
        return parseGroupStateIntoInfluxDataObject(state);
    }
}

module.exports = {GroupDataSender};
