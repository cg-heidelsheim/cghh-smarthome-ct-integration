export class HMIPWSHomeWeather {
    temperature: number;
    weatherCondition: string;
    weatherDayTime: string;
    minTemperature: number;
    maxTemperature: number;
    humidity: number;
    windSpeed: number;
    windDirection?: number;
    vaporAmount: number;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    constructor(json: Record<string, any>) {
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
