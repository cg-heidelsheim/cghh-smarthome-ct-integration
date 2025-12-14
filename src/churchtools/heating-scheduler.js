const moment = require("moment");

class HeatingScheduler {
    /**
     * Calculates when heating for a room should start for a given event/booking.
     *
     * @param {RoomConfig} roomConfig
     * @param {Event} event
     * @param {GroupState} groupState
     * @param {Booking} booking
     *
     * @returns {{
     *   shouldStartHeating: boolean,
     *   minutesUntilHeatingStart: number,
     *   minutesToReachTemp: number,
     *   minutesPreOfBooking: number,
     *   heatingStartTime: import('moment').Moment
     * }}
     */
    static calculateHeatingSchedule(roomConfig, event, groupState, booking) {
        const now = moment();
        const eventStart = moment(event.startDate);

        const minutesPreOfBooking = booking.minPre ?? 0;

        let minutesToReachTemp = roomConfig.getMinutesNeededToReachTemperatureForEvent(
            event,
            groupState
        );
        minutesToReachTemp = Math.round(minutesToReachTemp) + minutesPreOfBooking;

        const heatingStartTime = eventStart.clone().subtract(minutesToReachTemp, 'minute');

        let minutesUntilHeatingStart = moment
            .duration(heatingStartTime.diff(now))
            .asMinutes();
        minutesUntilHeatingStart = Math.round(minutesUntilHeatingStart)

        const shouldStartHeating = heatingStartTime.isSameOrBefore(now);

        return {
            shouldStartHeating,
            minutesUntilHeatingStart,
            minutesToReachTemp,
            minutesPreOfBooking
        };
    }
}

module.exports = {HeatingScheduler}