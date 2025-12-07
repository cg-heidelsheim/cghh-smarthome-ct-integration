const Booking = require("./booking");

/**
 * Represents an Event with start and end dates, a name, category, and bookings.
 */
class Event {
    /**
     * Create an Event.
     * @param {string} startDate - The start date and time of the event (YYYY-MM-DD HH:mm:ss).
     * @param {string} endDate - The end date and time of the event (YYYY-MM-DD HH:mm:ss).
     * @param {string} name - The name/description of the event.
     * @param {string} categoryId - The category ID the event belongs to.
     * @param {string} categoryName - The category name.
     * @param {Object} bookings - An object containing booking entries.
     */
    constructor(startDate, endDate, name, categoryId, categoryName, bookings = {}) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.bookings = bookings; // expected to be a Map or object with bookingId keys and Booking instances as values
    }

    /**
     * @param {any} json
     * @returns {Event}
     */
    static fromJSON(json) {
        const bookingsArray = json.bookings
            ? Object.values(json.bookings).map(b => Booking.fromJSON(b))
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

module.exports = {Event};
