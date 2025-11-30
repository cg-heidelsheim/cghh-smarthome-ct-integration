const fs = require('fs');
const fse = require('fs-extra');
const { WeatherStateDB } = require('../../../src/homematic/weather/weather-state.db');
const { WeatherState } = require('../../../src/homematic/weather/weather-state');

const mockFilePath = process.cwd() + "/persistent/states/weather.json";

const memoryFileStore = {};
fse.outputFileSync = jest.fn((file, data) => {
  memoryFileStore[file] = data;
});

// Spy on fs.readFileSync and mock implementation
const originalReadFileSync = fs.readFileSync;

jest.spyOn(fs, 'readFileSync').mockImplementation((file) => {
  if (memoryFileStore[file]) {
    return memoryFileStore[file];
  }
});

describe('WeatherStateDB', () => {
  let db;
  let state;

  beforeEach(() => {
    db = new WeatherStateDB();
    state = new WeatherState();

    state.id = 'weather-123';
    state.label = 'Test Location';
    state.temperature = 15;
    state.minTemperature = 10;
    state.maxTemperature = 20;
    state.humidity = 70;
    state.windSpeed = 5;
    state.vaporAmount = 1.5;
    state.weatherCondition = 'Cloudy';
    state.weatherDayTime = 'Afternoon';

    for (const key in memoryFileStore) delete memoryFileStore[key];
    fse.outputFileSync.mockClear();
    fs.readFileSync.mockClear();
  });

  afterAll(() => {
    fs.readFileSync.mockRestore();
  });

  test('save method writes correct data to file', () => {
    db.save(state);
    expect(fse.outputFileSync).toHaveBeenCalledWith(
      mockFilePath,
      expect.stringContaining('weather-123')
    );

    const savedJSON = JSON.parse(memoryFileStore[mockFilePath]);
    expect(savedJSON['weather-123']).toEqual({
      id: 'weather-123',
      label: 'Test Location',
      temperature: 15,
      minTemperature: 10,
      maxTemperature: 20,
      humidity: 70,
      windSpeed: 5,
      vaporAmount: 1.5,
      weatherCondition: 'Cloudy',
      weatherDayTime: 'Afternoon'
    });
  });

  test('getFileContent retrieves existing data', () => {
    const prepopulatedData = {
      'weather-123': {
        id: 'weather-123',
        label: 'Test Location',
        temperature: 15,
        minTemperature: 10,
        maxTemperature: 20,
        humidity: 70,
        windSpeed: 5,
        vaporAmount: 1.5,
        weatherCondition: 'Cloudy',
        weatherDayTime: 'Afternoon'
      }
    };

    memoryFileStore[mockFilePath] = JSON.stringify(prepopulatedData);

    const dataFromFile = db._readFile();
    expect(dataFromFile).toEqual(prepopulatedData);
  });

  test('save updates existing data', () => {
    memoryFileStore[mockFilePath] = JSON.stringify({
      'weather-123': {
        label: 'Old Location',
        temperature: 10
      }
    });

    db.save(state);

    const savedJSON = JSON.parse(memoryFileStore[mockFilePath]);
    expect(savedJSON['weather-123']).toEqual(expect.objectContaining({
      label: 'Test Location',
      temperature: 15
    }));
  });

  test('throws error when file missing on read', () => {
    delete memoryFileStore[mockFilePath];
    expect(() => db._readFile()).toThrow(/Failed to read or parse/);
  });
});
