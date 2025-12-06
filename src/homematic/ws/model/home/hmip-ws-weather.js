class HMIPWSHomeWeather {
    constructor(json) {
        this.temperature = json.temperature;
        this.weatherCondition = json.weatherCondition;
        this.weatherDayTime = json.weatherDayTime;
        this.minTemperature = json.minTemperature;
        this.maxTemperature = json.maxTemperature;
        this.humidity = json.humidity;
        this.windSpeed = json.windSpeed;
        this.windDirection = json.windDirection;
        this.vaporAmount = json.vaporAmount;
    }
}

module.exports = {HMIPWSHomeWeather}
