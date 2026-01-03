const {DataSender} = require("./data-sender.base");
const {EventDataPoint} = require("../model/EventDataPoint");
const {parseEventDataPointIntoInfluxDataObject} = require("../util/homematic-influx.mapper");

class EventDataSender extends DataSender {

    constructor() {
        super("events");
    }

    /**
     * @param args
     * @param {EventDataPoint}     args[0] eventDataPoint
     */
    parseData(...args) {
        const [eventDataPoint] = args;
        return parseEventDataPointIntoInfluxDataObject(eventDataPoint);
    }
}

module.exports = {EventDataSender};
