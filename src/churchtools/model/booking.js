/**
 * Represents a Booking entry related to an Event.
 */
class Booking {
  /**
   * Create a booking.
   * @param {string} id - The unique booking ID.
   * @param {number} minPre - Minutes before the event start reserved.
   * @param {number} minPost - Minutes after the event end reserved.
   * @param {string} resourceId - Resource ID associated with booking.
   * @param {string} statusId - Status ID of the booking.
   * @param {string|null} location - Optional location info.
   * @param {string|null} note - Optional note or comment.
   */
  constructor(id, minPre, minPost, resourceId, statusId, location = null, note = null) {
    this.id = id;
    this.minPre = minPre;
    this.minPost = minPost;
    this.resourceId = resourceId;
    this.statusId = statusId;
    this.location = location;
    this.note = note;
  }

  /**
   * Returns a JSON representation of the booking.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      minpre: this.minPre,
      minpost: this.minPost,
      resource_id: this.resourceId,
      status_id: this.statusId,
      location: this.location,
      note: this.note
    };
  }

  static fromJSON(json) {
    return new Booking(
        json.id,
        json.minpre,
        json.minpost,
        json.resource_id,
        json.status_id,
        json.location,
        json.note
    );
  }
}

module.exports = Booking;
