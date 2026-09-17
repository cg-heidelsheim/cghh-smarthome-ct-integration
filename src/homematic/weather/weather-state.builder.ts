import {WeatherState} from '../../db/model/weather-state';
import type {HMIPWSHome} from '../ws/model/home/hmip-ws-home';

export class WeatherStateBuilder {
    /**
     * Transform a HMIP home (weather) object into a weather state object for DB storage.
     *
     * `home.location`/`home.weather` are typed nullable (the raw payload doesn't always
     * carry them), but the non-null assertions below match the original JS, which read
     * straight through with no null-check and would have thrown the same way on a
     * genuinely missing location/weather - not something to silently fix here.
     */
    static fromHomematicHome(home: HMIPWSHome): WeatherState {
        const weatherState = new WeatherState();

        weatherState.label = home.location!.city.split(',')[0];
        weatherState.temperature = home.weather!.temperature;
        weatherState.minTemperature = home.weather!.minTemperature;
        weatherState.maxTemperature = home.weather!.maxTemperature;
        weatherState.humidity = home.weather!.humidity;
        weatherState.windSpeed = home.weather!.windSpeed;
        weatherState.vaporAmount = home.weather!.vaporAmount;
        weatherState.weatherCondition = home.weather!.weatherCondition;
        weatherState.weatherDayTime = home.weather!.weatherDayTime;

        return weatherState;
    }

    /**
     * Built a dummy object, representing a placeholder for the first save.
     * Contains a label with the value "INIT" that can later be checked for different logging and processing
     */
    static dummyState(): WeatherState {
        const weatherState = new WeatherState();

        weatherState.label = 'INIT';

        return weatherState;
    }
}
