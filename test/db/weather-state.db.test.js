const fs = require('fs');
const fse = require('fs-extra');
// NOTE: no `jest.mock('fs-extra')` here on purpose. This repo's jest transform
// does not run plain .js test files through babel-jest, so `jest.mock()` calls
// are NOT hoisted above requires. If a module-under-test is required *after*
// `jest.mock('fs-extra')`, it gets a different (automocked) fs-extra object
// than this file's own `fse`, and jest.spyOn(fse, ...) silently spies on the
// wrong object (0 recorded calls). Requiring the module under test first, then
// spying directly on the real shared `fse`/`fs` module objects (as
// test/db/json-file.db.test.js does), avoids the whole hazard.
const {WeatherStateDB} = require('../../src/db/weather-state.db');

describe('WeatherStateDB', () => {
    let db;
    const outputFileSyncMock = jest.spyOn(fse, 'outputFileSync').mockImplementation(jest.fn());
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    beforeEach(() => {
        outputFileSyncMock.mockClear();
        existsSyncSpy.mockClear().mockReturnValue(true);
        db = new WeatherStateDB();
    });

    afterAll(() => {
        outputFileSyncMock.mockRestore();
        existsSyncSpy.mockRestore();
    });

    // Characterization: unlike every other JsonFileDB subclass, WeatherStateDB
    // overrides save() to key entries by `state.label`, not `state.id` (the base
    // class's default `save(state) { this.saveById(state.id, state) }`).
    it('save() keys the record by label, not id', () => {
        jest.spyOn(db, '_readFile').mockReturnValue({});
        const state = {id: 'weather-home', label: 'Heidelsheim', temperature: 18.4};

        db.save(state);

        expect(outputFileSyncMock).toHaveBeenCalledWith(
            db.filePath,
            JSON.stringify({Heidelsheim: {id: 'weather-home', label: 'Heidelsheim', temperature: 18.4}}, null, 2)
        );
    });

    it('save() writes a shallow copy, not the original object reference', () => {
        jest.spyOn(db, '_readFile').mockReturnValue({});
        const state = {id: 'weather-home', label: 'Heidelsheim', temperature: 18.4};

        db.save(state);
        state.temperature = 99;

        const written = JSON.parse(outputFileSyncMock.mock.calls[0][1]);
        expect(written.Heidelsheim.temperature).toBe(18.4);
    });
});
