/**
 * Represents the weather state with relevant attributes for comparison.
 */
class WeatherState {
    /**
     * Label describing the weather state.
     * Usually contains the location from the weather data like Bruchsal.
     * @type {string}
     */
    label;

    /**
     * Current temperature.
     * @type {number}
     */
    temperature;

    /**
     * Minimum temperature of the day.
     * @type {number}
     */
    minTemperature;

    /**
     * Maximum temperature of the day.
     * @type {number}
     */
    maxTemperature;

    /**
     * Current humidity percentage.
     * @type {number}
     */
    humidity;

    /**
     * Wind speed.
     * @type {number}
     */
    windSpeed;

    /**
     * Vapor amount.
     * @type {number}
     */
    vaporAmount;

    /**
     * Weather condition description.
     * Something like cloudy, windy, sunny etc.
     * @type {string}
     */
    weatherCondition;

    /**
     * Descriptor for the time of day of the weather.
     * @type {string}
     */
    weatherDayTime;

    /**
     * Compares the significant value attributes of this WeatherState instance with another.
     * Ignores the label and compares only the weather-related data fields.
     *
     * @param {WeatherState} other Another WeatherState instance to compare.
     * @returns {boolean} True if these value attributes are equal, false otherwise.
     */
    equalsValueAttributes(other) {
        if (!other) return false;
        return this.temperature === other.temperature &&
               this.minTemperature === other.minTemperature &&
               this.maxTemperature === other.maxTemperature &&
               this.humidity === other.humidity &&
               this.windSpeed === other.windSpeed &&
               this.vaporAmount === other.vaporAmount &&
               this.weatherCondition === other.weatherCondition &&
               this.weatherDayTime === other.weatherDayTime;
    }

    constructor() {
        // Initialization can be added here if needed.
    }
}

module.exports = { WeatherState };
