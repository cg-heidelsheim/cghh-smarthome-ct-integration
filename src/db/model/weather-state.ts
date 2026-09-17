import {shallowEqualsOn} from './shallow-equals.util';

/**
 * Represents the weather state with relevant attributes for comparison.
 */
export class WeatherState {
    /** Label describing the weather state, usually the location (e.g. "Bruchsal"). */
    label!: string;

    /** Current temperature. */
    temperature!: number;

    /** Minimum temperature of the day. */
    minTemperature!: number;

    /** Maximum temperature of the day. */
    maxTemperature!: number;

    /** Current humidity percentage. */
    humidity!: number;

    /** Wind speed. */
    windSpeed!: number;

    /** Vapor amount. */
    vaporAmount!: number;

    /** Weather condition description, e.g. cloudy, windy, sunny. */
    weatherCondition!: string;

    /** Descriptor for the time of day of the weather. */
    weatherDayTime!: string;

    /**
     * Compares the significant value attributes of this WeatherState instance with another.
     * Ignores the label and compares only the weather-related data fields.
     *
     * @param other Another WeatherState instance to compare.
     * @returns True if these value attributes are equal, false otherwise.
     */
    equalsValueAttributes(other: WeatherState): boolean {
        return shallowEqualsOn(this, other, [
            'temperature', 'minTemperature', 'maxTemperature', 'humidity',
            'windSpeed', 'vaporAmount', 'weatherCondition', 'weatherDayTime'
        ]);
    }
}
