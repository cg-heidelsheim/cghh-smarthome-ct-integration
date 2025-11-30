const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { JsonFileDB } = require('../../../src/homematic/db/json-file.db.js');

jest.mock('fs-extra');

const existsSyncSpy = jest.spyOn(fs, 'existsSync');
const outputFileSyncMock = jest.spyOn(fse, 'outputFileSync').mockImplementation(jest.fn());

const testFilePath = path.resolve(__dirname, 'testfile.json');

describe('JsonFileDB', () => {
  let db;

  beforeEach(() => {
    existsSyncSpy.mockClear();
    outputFileSyncMock.mockClear();
    if (fse.ensureFile.mockClear) fse.ensureFile.mockClear();
    if (fse.writeFile.mockClear) fse.writeFile.mockClear();
    if (fse.readFile.mockClear) fse.readFile.mockClear();

    db = new JsonFileDB(testFilePath);
  });

  afterAll(() => {
    existsSyncSpy.mockRestore();
    outputFileSyncMock.mockRestore();
  });

  describe('constructor', () => {
    it('should assign the file path', () => {
      expect(db.filePath).toBe(testFilePath);
    });

    it('should create the JSON file if missing', () => {
      existsSyncSpy.mockReturnValue(false);
      db.ensureFileExists();
      expect(outputFileSyncMock).toHaveBeenCalledWith(testFilePath, JSON.stringify({}, null, 2));
    });
  });

  describe('_readFile', () => {
    it('should return parsed JSON from file', () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ key: 'value' }));
      expect(db._readFile()).toEqual({ key: 'value' });
      fs.readFileSync.mockRestore();
    });

    it('should throw error if JSON parsing fails', () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue('bad json');
      expect(() => db._readFile()).toThrow();
      fs.readFileSync.mockRestore();
    });
  });

  describe('saveById', () => {
    it('should write updated data to file', () => {
      const id = 'id1';
      const data = { value: 123 };
      jest.spyOn(db, '_readFile').mockReturnValue({});
      db.saveById(id, data);
      expect(outputFileSyncMock).toHaveBeenCalledWith(testFilePath, JSON.stringify({ [id]: data }, null, 2));
    });

    it('should start fresh if _readFile throws error', () => {
      const id = 'id2';
      const data = { value: 456 };
      jest.spyOn(db, '_readFile').mockImplementation(() => { throw new Error('Fail'); });
      db.saveById(id, data);
      expect(outputFileSyncMock).toHaveBeenCalledWith(testFilePath, JSON.stringify({ [id]: data }, null, 2));
    });
  });

  describe('getById', () => {
    it('should return data when id found', () => {
      const data = { value: 'abc' };
      jest.spyOn(db, '_readFile').mockReturnValue({ 'id1': data });
      expect(db.getById('id1')).toEqual(data);
    });

    it('should throw error when id not found', () => {
      jest.spyOn(db, '_readFile').mockReturnValue({});
      expect(() => db.getById('missing')).toThrow('Entry with id missing not found in DB.');
    });
  });
});
