const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Berlin");

class Lock {

    /** @type {string} HMIP group ID */
    id;
    /** @type {string} UTC Timestamp as string*/
    expiring;
    /** @type {string} */
    eventName;

    /**
     * Check if lock is expired.
     * Locks are expired if current date is after expiration date
     *
     * @returns {boolean}
     */
    isExpired = () => {
        const currentTime = moment();
        const expiryDate = moment(this.expiring);

        return currentTime.isAfter(expiryDate);
    };
}

module.exports = {Lock};