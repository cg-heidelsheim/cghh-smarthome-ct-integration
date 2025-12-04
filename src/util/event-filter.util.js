const {Event} = require("./../churchtools/model/event");
const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Berlin");

/**
 * Filters events that are currently active or start in the future.
 *
 * @param {Event[]} events - List of event objects with startDate/endDate.
 * @returns {Array} Sorted list of upcoming or active events.
 */
function filterCurrentAndUpcomingEvents(events) {
    const now = moment();

    return events
        .filter(event => {
            const start = moment(event.startDate);
            const end = moment(event.endDate);

            return start.isAfter(now) || now.isBetween(start, end);
        })
        .sort((a, b) => moment(a.startDate) - moment(b.startDate));
}

module.exports = {
    filterCurrentAndUpcomingEvents
};