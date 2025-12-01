const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const { LockDB } = require('../../..//src/homematic/lock/lock.db.js');
const { Lock } = require('../../../src/homematic/lock/lock.js');

const mockFilePath = path.join(process.cwd(), 'persistent', 'locks.json');

const memoryFileStore = {};
fse.outputFileSync = jest.fn((file, data) => {
  memoryFileStore[file] = data;
});

jest.spyOn(fs, 'readFileSync').mockImplementation((file) => {
  if (memoryFileStore[file]) {
    return memoryFileStore[file];
  }
  throw new Error('File not found');
});

describe('LockDB', () => {
  let db;
  let lock;

  beforeEach(() => {
    db = new LockDB();
    lock = new Lock();

    lock.id = 'lock-123';
    lock.expiring = moment().add(1, 'hour').toISOString();
    lock.eventName = 'LockEvent';

    for (const key in memoryFileStore) delete memoryFileStore[key];
    fse.outputFileSync.mockClear();
    fs.readFileSync.mockClear();
  });

  afterAll(() => {
    fs.readFileSync.mockRestore();
  });

  test('saveById method writes correct data to file', () => {
    db.saveById(lock.id, {
      id: lock.id,
      expiring: lock.expiring,
      eventName: lock.eventName
    });
    expect(fse.outputFileSync).toHaveBeenCalledWith(
        mockFilePath,
        expect.stringContaining(lock.id)
    );

    const savedJSON = JSON.parse(memoryFileStore[mockFilePath]);
    expect(savedJSON[lock.id]).toEqual({
      id: lock.id,
      expiring: lock.expiring,
      eventName: lock.eventName
    });
  });

  test('getById returns the correct lock', () => {
    const sampleLocks = {
      'lock1': {
        id: 'lock1',
        expiring: moment().toISOString(),
        eventName: 'event1'
      },
      'lock2': {
        id: 'lock2',
        expiring: moment().toISOString(),
        eventName: 'event2'
      }
    };
    memoryFileStore[mockFilePath] = JSON.stringify(sampleLocks);

    const lockObj = db.getById('lock1');
    expect(lockObj).toBeInstanceOf(Lock);
    expect(lockObj.id).toBe('lock1');
  });

  test('getById throws if lock does not exist', () => {
    memoryFileStore[mockFilePath] = JSON.stringify({});
    expect(() => db.getById('nonexistent')).toThrow(/not found/);
  });

  test('_readFile throws error if file missing or unreadable', () => {
    delete memoryFileStore[mockFilePath];
    expect(() => db._readFile()).toThrow(/Failed to read or parse/);
  });
});

describe('Lock', () => {
  let lock;

  beforeEach(() => {
    lock = new Lock();
  });

  test('isExpired returns false for future expiration', () => {
    lock.expiring = moment().add(1, 'hour').toISOString();
    expect(lock.isExpired()).toBe(false);
  });

  test('isExpired returns true for past expiration', () => {
    lock.expiring = moment().subtract(1, 'hour').toISOString();
    expect(lock.isExpired()).toBe(true);
  });
});
