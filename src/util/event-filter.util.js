const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Berlin");

/**
 * Filters events that are currently active or start in the future.
 *
 * @param {Array} events - List of event objects with startdate/enddate.
 * @returns {Array} Sorted list of upcoming or active events.
 */
function filterCurrentAndUpcomingEvents(events) {
    const now = moment();

    return events
        .filter(event => {
            const start = moment(event.startdate);
            const end = moment(event.enddate);

            return start.isAfter(now) || now.isBetween(start, end);
        })
        .sort((a, b) => moment(a.startdate) - moment(b.startdate));
}

module.exports = {
    filterCurrentAndUpcomingEvents
};