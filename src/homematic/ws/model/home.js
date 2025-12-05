const {HMIPWSWeather} = require("./weaather");

class HMIPWSHome {
    /**
     * @param {Object} raw
     * @param {Object} raw.weather - raw weather object (from API)
     * // + many more fields which we simply assign directly
     */
    constructor(raw = {}) {
        Object.assign(this, raw);

        if (raw.weather) {
            this.weather = HMIPWSWeather.from(raw.weather);
        }
    }

    /**
     * Factory helper for whole JSON input
     */
    static from(json) {
        return new HMIPWSHome(json);
    }
}

module.exports = {HMIPWSHome}