const {fromJSON} = require("./booking");

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
     * Add a booking to this event.
     * @param {Booking} booking - The booking to add.
     */
    addBooking(booking) {
        this.bookings[booking.id] = booking;
    }

    /**
     * Get a booking by its ID.
     * @param {string} id - Booking ID.
     * @returns {Booking | undefined} - The found booking or undefined if not found.
     */
    getBooking(id) {
        return this.bookings[id];
    }

    /**
     * Returns a JSON representation of the event including bookings.
     * @returns {Object}
     */
    toJSON() {
        return {
            startdate: this.startDate,
            enddate: this.endDate,
            bezeichnung: this.name,
            category_id: this.categoryId,
            category_name: this.categoryName,
            bookings: this.bookings,
        };
    }

    /**
     * @param json
     * @returns {Event}
     */
    static fromJSON(json) {
        return new Event(
            json.startDate,
            json.endDate,
            json.name,
            json.categoryId,
            json.categoryName,
            json.bookings.map(jsonBooking => fromJSON(jsonBooking)),
        );
    }
}

module.exports = Event;
