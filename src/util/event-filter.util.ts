import moment from './timezone.bootstrap';
import type {Event} from '../churchtools/model/event';

/**
 * Filters events that are currently active or start in the future.
 *
 * @param events - List of event objects with startDate/endDate.
 * @returns Sorted list of upcoming or active events.
 */
export function filterCurrentAndUpcomingEvents(events: Event[]): Event[] {
    const now = moment();

    return events
        .filter(event => {
            const start = moment(event.startDate);
            const end = moment(event.endDate);

            return start.isAfter(now) || now.isBetween(start, end);
        })
        .sort((a, b) => Number(moment(a.startDate)) - Number(moment(b.startDate)));
}
