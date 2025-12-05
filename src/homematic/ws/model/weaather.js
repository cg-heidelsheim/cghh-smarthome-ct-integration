class HMIPWSWeather {
    /**
     * @param {Object} raw
     * @param {number} raw.temperature
     * @param {string} raw.weatherCondition
     * @param {string} raw.weatherDayTime
     * @param {number} raw.minTemperature
     * @param {number} raw.maxTemperature
     * @param {number} raw.humidity
     * @param {number} raw.windSpeed
     * @param {number} raw.windDirection
     * @param {number} raw.vaporAmount
     */
    constructor(raw = {}) {
        Object.assign(this, raw);
    }

    /**
     * Factory helper for raw JSON input
     */
    static from(rawJson) {
        return new HMIPWSWeather(rawJson);
    }
}

module.exports = {HMIPWSWeather}