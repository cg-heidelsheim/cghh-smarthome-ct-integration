/**
 * Represents an event data point with relevant attributes.
 */
class EventDataPoint {
  /**
   * @param {string} resourceName - Name of the booked resource.
   * @param {boolean} isActive - Indicates if the event is currently active.
   * @param {string} timestamp - Timestamp associated with the event data point.
   * @param {'event' | 'booking'} type - Type of the event data point.
   */
  constructor(resourceName, isActive, timestamp, type) {
    this.resourceName = resourceName;
    this.isActive = isActive;
    this.timestamp = timestamp;
    this.type = type;
  }

  /**
   * Name of the booked resource.
   * @type {string}
   */
  resourceName;

  /**
   * timestamp associated with the event data point.
   * @type {string}
   */
  timestamp;

  /**
   * Shows if the event is currently active.
   * @type {boolean}
   */
  isActive;

  /**
   * Shows if the event is currently active.
   * @type {'event' | 'booking'}
   */
  type;
}

module.exports = {EventDataPoint};
