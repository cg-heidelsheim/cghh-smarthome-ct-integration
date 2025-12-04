class EventRoomConfig {
    /**
     * Identifier of the event (name)
     * @type {string}
     */
    id;

    /**
     * Desired temperature for that exact event
     * @type {number}
     */
    desiredTemperature;


    /**
     * Comment explaining the decision
     * @type {string}
     */
    comment;
}

module.exports = {EventRoomConfig};
