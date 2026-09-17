const {WeatherStateBuilder} = require('../../../src/homematic/weather/weather-state.builder');

describe('WeatherStateBuilder', () => {
  describe('fromHomematicHome', () => {
    it('takes the label from the first comma-segment of the city and maps weather fields', () => {
      const home = {
        location: {city: 'Heidelsheim, Germany'},
        weather: {
          temperature: 5,
          minTemperature: 2,
          maxTemperature: 8,
          humidity: 70,
          windSpeed: 3.2,
          vaporAmount: 1.1,
          weatherCondition: 'CLOUDY',
          weatherDayTime: 'DAY',
        },
      };

      const state = WeatherStateBuilder.fromHomematicHome(home);

      expect(state.label).toBe('Heidelsheim');
      expect(state.temperature).toBe(5);
      expect(state.minTemperature).toBe(2);
      expect(state.maxTemperature).toBe(8);
      expect(state.humidity).toBe(70);
      expect(state.windSpeed).toBe(3.2);
      expect(state.vaporAmount).toBe(1.1);
      expect(state.weatherCondition).toBe('CLOUDY');
      expect(state.weatherDayTime).toBe('DAY');
    });
  });

  describe('dummyState', () => {
    it('builds a placeholder state labeled INIT, without an id (unlike the group/device builders)', () => {
      const state = WeatherStateBuilder.dummyState();

      expect(state.label).toBe('INIT');
      expect(state.id).toBeUndefined();
    });
  });
});
