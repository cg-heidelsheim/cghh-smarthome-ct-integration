const { WeatherState } = require('../../../src/homematic/weather/weather-state');

describe('WeatherState.equalsValueAttributes', () => {
  let stateA;
  let stateB;

  beforeEach(() => {
    stateA = new WeatherState();
    stateB = new WeatherState();

    stateA.temperature = 10;
    stateA.minTemperature = 5;
    stateA.maxTemperature = 15;
    stateA.humidity = 60;
    stateA.windSpeed = 10;
    stateA.vaporAmount = 2;
    stateA.weatherCondition = 'Sunny';
    stateA.weatherDayTime = 'Morning';
    stateA.label = 'Location A';

    stateB.temperature = 10;
    stateB.minTemperature = 5;
    stateB.maxTemperature = 15;
    stateB.humidity = 60;
    stateB.windSpeed = 10;
    stateB.vaporAmount = 2;
    stateB.weatherCondition = 'Sunny';
    stateB.weatherDayTime = 'Morning';
    stateB.label = 'Location B';
  });

  test('returns true when all value attributes are the same', () => {
    expect(stateA.equalsValueAttributes(stateB)).toBe(true);
  });

  test('returns false when any value attribute differs', () => {
    stateB.temperature = 20;
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
    stateB.temperature = 10; // reset

    stateB.minTemperature = 4;
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
    stateB.minTemperature = 5; // reset

    stateB.maxTemperature = 16;
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
    stateB.maxTemperature = 15; // reset

    stateB.humidity = 61;
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
    stateB.humidity = 60; // reset

    stateB.windSpeed = 11;
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
    stateB.windSpeed = 10; // reset

    stateB.vaporAmount = 3;
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
    stateB.vaporAmount = 2; // reset

    stateB.weatherCondition = 'Cloudy';
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
    stateB.weatherCondition = 'Sunny'; // reset

    stateB.weatherDayTime = 'Evening';
    expect(stateA.equalsValueAttributes(stateB)).toBe(false);
  });

  test('returns false if other is null or undefined', () => {
    expect(stateA.equalsValueAttributes(null)).toBe(false);
    expect(stateA.equalsValueAttributes(undefined)).toBe(false);
  });
});
