import Booking = require('./booking');

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

    constructor(startDate: string, endDate: string, name: string, categoryId: string, categoryName: string, bookings: Booking[] = []) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.bookings = bookings;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external API payload, genuinely untyped
    static fromJSON(json: any): Event {
        const bookingsArray: Booking[] = json.bookings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external API payload
            ? Object.values(json.bookings).map((b: any) => Booking.fromJSON(b))
            : [];

        return new Event(
            json.startdate,
            json.enddate,
            json.bezeichnung,
            json.category_id,
            json.category_name,
            bookingsArray,
        );
    }
}
