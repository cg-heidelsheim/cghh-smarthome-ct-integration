import Booking = require('./booking');

/**
 * ChurchTools' legacy calendar API has no explicit all-day flag. It reports an all-day
 * event as midnight on both ends: `startdate` = first day 00:00:00, `enddate` = *last* day
 * 00:00:00 (inclusive, so a single-day event has startdate === enddate). Taken literally
 * that is a zero-length event at midnight, which made the cron preheat for midnight, reset
 * the rooms to idle at midnight (lock expires at endDate), and then filter the event out
 * for the actual day. See `Event.fromJSON`.
 */
const ALL_DAY_DATE_PATTERN = /^(\d{4}-\d{2}-\d{2})[ T]00:00:00$/;

/** Heating window used in place of midnight-to-midnight for all-day events (Berlin local). */
const ALL_DAY_HEATING_START = '06:00:00';
const ALL_DAY_HEATING_END = '22:00:00';

/**
 * Represents an Event with start and end dates, a name, category, and bookings.
 */
export class Event {
    startDate: string;
    endDate: string;
    name: string;
    categoryId: string;
    categoryName: string;
    bookings: Booking[];
    allDay: boolean;

    constructor(startDate: string, endDate: string, name: string, categoryId: string, categoryName: string, bookings: Booking[] = [], allDay = false) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.bookings = bookings;
        this.allDay = allDay;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external API payload, genuinely untyped
    static fromJSON(json: any): Event {
        const bookingsArray: Booking[] = json.bookings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external API payload
            ? Object.values(json.bookings).map((b: any) => Booking.fromJSON(b))
            : [];

        let startDate: string = json.startdate;
        let endDate: string = json.enddate;
        let allDay = false;

        const startDay = ALL_DAY_DATE_PATTERN.exec(startDate ?? '')?.[1];
        const endDay = ALL_DAY_DATE_PATTERN.exec(endDate ?? '')?.[1];
        if (startDay && endDay) {
            startDate = `${startDay} ${ALL_DAY_HEATING_START}`;
            endDate = `${endDay} ${ALL_DAY_HEATING_END}`;
            allDay = true;
        }

        return new Event(
            startDate,
            endDate,
            json.bezeichnung,
            json.category_id,
            json.category_name,
            bookingsArray,
            allDay,
        );
    }
}
