const fse = require('fs-extra');
const { GroupStateDB } = require('../../../src/homematic/group/group-state.db');
const { GroupState } = require('../../../src/homematic/group/group-state');

const mockFilePath = process.cwd() + "/persistent/states/groups.json";

const memoryFileStore = {};
fse.outputFileSync = jest.fn((file, data) => {
  memoryFileStore[file] = data;
});

// Mock fs.readFileSync directly
const fs = require('fs');
const originalReadFileSync = fs.readFileSync;

jest.spyOn(fs, 'readFileSync').mockImplementation((file) => {
  if (memoryFileStore[file]) {
    return memoryFileStore[file];
  } else {
    throw new Error('File not found');
  }
});

describe('GroupStateDB', () => {
  let db;
  let state;

  beforeEach(() => {
    db = new GroupStateDB();
    state = new GroupState();

    state.id = 'group-123';
    state.label = 'Test Group';
    state.temperature = 21;
    state.setTemperature = 22;
    state.humidity = 55;

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
      expect.stringContaining('group-123')
    );

    const savedJSON = JSON.parse(memoryFileStore[mockFilePath]);
    expect(savedJSON['group-123']).toEqual({
      id: 'group-123',
      label: 'Test Group',
      temperature: 21,
      setTemperature: 22,
      humidity: 55
    });
  });

  test('getById retrieves existing state', () => {
    const prepopulatedData = {
      'group-123': {
        id: 'group-123',
        label: 'Test Group',
        temperature: 21,
        setTemperature: 22,
        humidity: 55
      }
    };
    memoryFileStore[mockFilePath] = JSON.stringify(prepopulatedData);

    const retrievedState = db.getById('group-123');
    expect(retrievedState).toBeInstanceOf(GroupState);
    expect(retrievedState.id).toBe('group-123');
    expect(retrievedState.temperature).toBe(21);
    expect(retrievedState.setTemperature).toBe(22);
    expect(retrievedState.humidity).toBe(55);
  });

  test('getById throws error if state not found', () => {
    memoryFileStore[mockFilePath] = '{}';
    expect(() => db.getById('non-existent-id')).toThrow(/not found/);
  });

  test('getById throws error if file missing', () => {
    delete memoryFileStore[mockFilePath];
    expect(() => db.getById('any-id')).toThrow(/Failed to read or parse/);
  });
});
