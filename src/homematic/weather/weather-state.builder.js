const {WeatherState} = require("../../db/model/weather-state");

class WeatherStateBuilder {
    /**
     * Transform a HMIP home (weather) object into a weather state object for DB storage.
     *
     * @param {HMIPWSHome} home Home object from HMIP
     * @returns {WeatherState}
     */
    static fromHomematicHome(home) {
        const weatherState = new WeatherState();

        weatherState.label = home.location.city.split(",")[0];
        weatherState.temperature = home.weather.temperature;
        weatherState.minTemperature = home.weather.minTemperature;
        weatherState.maxTemperature = home.weather.maxTemperature;
        weatherState.humidity = home.weather.humidity;
        weatherState.windSpeed = home.weather.windSpeed;
        weatherState.vaporAmount = home.weather.vaporAmount;
        weatherState.weatherCondition = home.weather.weatherCondition;
        weatherState.weatherDayTime = home.weather.weatherDayTime;

        return weatherState;
    }

    /**
     * Built a dummy object, representing a placeholder for the first save.
     * Contains a label with the value "INIT" that can later be checked for different logging and processing
     *
     * @returns {WeatherState}
     */
    static dummyState() {
        const weatherState = new WeatherState();

        weatherState.label = "INIT";

        return weatherState;
    }
}

module.exports = {WeatherStateBuilder};