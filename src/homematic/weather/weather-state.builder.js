const {WeatherState} = require("../../db/model/weather-state");
const {Home} = require("./home");

class WeatherStateBuilder {
    /**
     * Transform a HMIP home (weather) object into a weather state object for DB storage.
     *
     * @param {Home} home Home object from HMIP
     * @returns {WeatherState}
     */
    static fromHomematicHome(home) {
        const weatherState = new WeatherState();

        weatherState.label = home.data.location.city.split(",")[0];
        weatherState.temperature = home.data.weather.temperature;
        weatherState.minTemperature = home.data.weather.minTemperature;
        weatherState.maxTemperature = home.data.weather.maxTemperature;
        weatherState.humidity = home.data.weather.humidity;
        weatherState.windSpeed = home.data.weather.windSpeed;
        weatherState.vaporAmount = home.data.weather.vaporAmount;
        weatherState.weatherCondition = home.data.weather.weatherCondition;
        weatherState.weatherDayTime = home.data.weather.weatherDayTime;

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