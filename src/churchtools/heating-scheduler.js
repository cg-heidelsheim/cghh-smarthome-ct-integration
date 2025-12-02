const moment = require("moment");

class HeatingScheduler {
    /**
     * Calculates when heating for a room should start for a given event/booking.
     *
     * @param {RoomConfig} roomConfig
     * @param {Object} event
     * @param {GroupState} groupState
     * @param {Object} booking
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
        const eventStart = moment(event.startdate);

        const minutesPreOfBooking = booking.minpre ?? 0;

        let minutesToReachTemp = roomConfig.getMinutesNeededToReachTemperatureForEvent(
            event,
            groupState
        );
        minutesToReachTemp = Math.round(minutesToReachTemp) + minutesPreOfBooking;

        const heatingStartTime = eventStart.clone().subtract(minutesToReachTemp, 'minute');

        const minutesUntilHeatingStart = moment
            .duration(heatingStartTime.diff(now))
            .asMinutes();

        const shouldStartHeating = heatingStartTime.isSameOrBefore(now);

        return {
            shouldStartHeating,
            minutesUntilHeatingStart,
            minutesToReachTemp,
            minutesPreOfBooking,
            heatingStartTime,
        };
    }
}

exports.module = {HeatingScheduler}