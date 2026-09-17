import moment from 'moment';
import type {RoomConfig} from '../db/model/room-config';
import type {Event} from './model/event';
import type {GroupState} from '../db/model/group-state';
import type Booking = require('./model/booking');
import type {EventRoomConfig} from '../db/model/event-room-config.model';

export class HeatingScheduler {
    /**
     * Calculates when heating for a room should start for a given event/booking.
     */
    static calculateHeatingSchedule(roomConfig: RoomConfig, event: Event, groupState: GroupState, booking: Booking, eventRoomConfigs: EventRoomConfig[]): {
        shouldStartHeating: boolean;
        minutesUntilHeatingStart: number;
        minutesToReachTemp: number;
        minutesPreOfBooking: number;
    } {
        const now = moment();
        const eventStart = moment(event.startDate);

        const minutesPreOfBooking = booking.minPre ?? 0;

        let minutesToReachTemp = roomConfig.getMinutesNeededToReachTemperatureForEvent(
            event,
            groupState,
            eventRoomConfigs
        );
        minutesToReachTemp = Math.round(minutesToReachTemp) + minutesPreOfBooking;

        const heatingStartTime = eventStart.clone().subtract(minutesToReachTemp, 'minute');

        let minutesUntilHeatingStart = moment
            .duration(heatingStartTime.diff(now))
            .asMinutes();
        minutesUntilHeatingStart = Math.round(minutesUntilHeatingStart);

        const shouldStartHeating = heatingStartTime.isSameOrBefore(now);

        return {
            shouldStartHeating,
            minutesUntilHeatingStart,
            minutesToReachTemp,
            minutesPreOfBooking
        };
    }
}
