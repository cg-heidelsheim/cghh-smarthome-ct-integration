import type {GroupState} from '../db/model/group-state';
import type {ChannelState} from '../db/model/channel-state';
import type {WeatherState} from '../db/model/weather-state';
import type {InfluxDataPoint} from '../timeseries/influx/influx-data-point';

/**
 * Take information of a {@link GroupState} and parse it into an influx usable DB object
 */
export const parseGroupStateIntoInfluxDataObject = (state: GroupState): InfluxDataPoint => {
    return {
        label: 'sensoric',
        values: {
            temperature: state.temperature,
            setTemperature: state.setTemperature,
            humidity: state.humidity,
        },
        tags: {
            name: state.label.replace(/\s/g, '_'),
            type: 'HEATING'
        }
    };
};

export const parseDeviceStateChannelIntoInfluxDataObject = (state: {label: string}, channel: ChannelState): InfluxDataPoint => {
    return {
        label: 'sensoric',
        values: {
            temperature: channel.temperature,
            setTemperature: channel.setTemperature,
        },
        tags: {
            channel: channel.index,
            name: state.label.replace(/\s/g, '_'),
            type: 'HEATING_THERMOSTAT'
        }
    };
};

/**
 * Take information of heating group and parse it into an influx parsable DB object
 */
export const parseHeatingGroupDataIntoInfluxDataObject = (group: {
    label: string;
    actualTemperature: number;
    setPointTemperature: number;
    humidity: number;
}): InfluxDataPoint => {
    return {
        label: group.label,
        values: {
            temperature: group.actualTemperature,
            setTemperature: group.setPointTemperature,
            humidity: group.humidity,
        }
    };
};

/**
 * Take information of a {@link WeatherState} and parse it into an influx usable DB object
 */
export const parseWeatherStateIntoInfluxDataObject = (state: WeatherState): InfluxDataPoint => {
    const temperature = state.temperature;
    const minTemperature = state.minTemperature;
    const maxTemperature = state.maxTemperature;
    const windSpeed = state.windSpeed;
    const vaporAmount = state.vaporAmount;
    const humidity = state.humidity;

    return {
        label: state.label,
        values: {
            temperature,
            humidity,
            minTemperature,
            maxTemperature,
            windSpeed,
            vaporAmount
        },
        // tags: {
        //     weatherDayTime: state.weatherDayTime,
        //     weatherCondition: state.weatherCondition,
        //     tag: "ALL"
        // }
    };
};
