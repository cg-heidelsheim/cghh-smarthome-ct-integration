const {HMIPWSEvent} = require('./hmip-ws-event');
const {HMIPWSHome} = require('../home/hmip-ws-home');

/**
 * HOME_CHANGED event
 */
class HMIPWSHomeChangedEvent extends HMIPWSEvent {
    /**
     * @param {HMIPWSHome} home
     */
    constructor(home) {
        super('HOME_CHANGED');
        this.home = home;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSHomeChangedEvent}
     */
    static fromJson(json) {
        const home = HMIPWSHome.fromJson(json.home);
        return new HMIPWSHomeChangedEvent(home);
    }
}

module.exports = {HMIPWSHomeChangedEvent}