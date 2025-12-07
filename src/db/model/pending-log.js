/**
 * Represents information about a pending log entry.
 *
 * A pending log is used to record automatic actions separately from manual changes.
 * When an automatic action is performed (e.g., setting temperature), it inadvertently triggers a WebSocket event,
 * which is processed on another end
 *
 * To handle this, a pending log object is created when the automatic action occurs.
 * Later, when the corresponding WebSocket message arrives, it can be matched to this pending log.
 *
 * This allows the system to correctly identify and log the websocket event as an automatic action triggered earlier
 *
 * Example JSON representation as stored on disk:
 * {
 *   "id": "301...",
 *   "eventName": "Gebetskreis",
 * }
 */

class PendingLog {

    /**
     * Unique identifier of the HMIP group
     * @type {string}
     */
    id;

    /**
     * Name of the event for which the action was made
     * @type {string}
     */
    eventName;
}

module.exports = {PendingLog};
