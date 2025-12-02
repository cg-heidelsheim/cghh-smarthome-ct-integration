const fs = require('fs');
const fse = require('fs-extra');
const { DeviceStateDB } = require('../../src/db/device-state.db');
const { DeviceState } = require('../../src/db/model/device-state');

const mockFilePath = process.cwd() + "/persistent/states/devices.json";

const memoryFileStore = {};
fse.outputFileSync = jest.fn((file, data) => {
  memoryFileStore[file] = data;
});

jest.spyOn(fs, 'readFileSync').mockImplementation((file) => {
  if (memoryFileStore[file]) {
    return memoryFileStore[file];
  }
});

describe('DeviceStateDB', () => {
  let db;
  let state;

  beforeEach(() => {
    db = new DeviceStateDB();
    state = new DeviceState();

    state.id = 'device-123';
    state.label = 'Test Device';
    state.channels = [
      {
        index: 1,
        valvePosition: 0,
        temperature: 18.6,
        setTemperature: 16
      }
    ];

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
      expect.stringContaining('device-123')
    );

    const savedJSON = JSON.parse(memoryFileStore[mockFilePath]);
    expect(savedJSON['device-123']).toEqual({
      id: 'device-123',
      label: 'Test Device',
      channels: state.channels
    });
  });

  test('getFileContent retrieves existing data', () => {
    const prepopulatedData = {
      'device-123': {
        id: 'device-123',
        label: 'Test Device',
        channels: [
          {
            index: 1,
            valvePosition: 0,
            temperature: 18.6,
            setTemperature: 16
          }
        ]
      }
    };

    memoryFileStore[mockFilePath] = JSON.stringify(prepopulatedData);

    const dataFromFile = db._readFile();
    expect(dataFromFile).toEqual(prepopulatedData);
  });

  test('save updates existing data', () => {
    memoryFileStore[mockFilePath] = JSON.stringify({
      'device-123': {
        label: 'Old Device',
        channels: []
      }
    });

    db.save(state);

    const savedJSON = JSON.parse(memoryFileStore[mockFilePath]);
    expect(savedJSON['device-123']).toEqual(expect.objectContaining({
      label: 'Test Device'
    }));
  });

  test('throws error when file missing on read', () => {
    delete memoryFileStore[mockFilePath];
    expect(() => db._readFile()).toThrow(/Failed to read or parse/);
  });
});
