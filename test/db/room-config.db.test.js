const fs = require('fs');
const fse = require('fs-extra');
// See test/db/weather-state.db.test.js for why there's no `jest.mock('fs-extra')`
// here: this repo's jest transform doesn't hoist jest.mock() above requires for
// plain .js test files, so the module-under-test must be required before any
// jest.mock('fs-extra') call, or its internal fse ends up being a different
// object than the one spied on here.
const {RoomConfigDB} = require('../../src/db/room-config.db');

describe('RoomConfigDB', () => {
    let db;
    const outputFileSyncMock = jest.spyOn(fse, 'outputFileSync').mockImplementation(jest.fn());
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    beforeEach(() => {
        outputFileSyncMock.mockClear();
        existsSyncSpy.mockClear().mockReturnValue(true);
        db = new RoomConfigDB();
    });

    afterAll(() => {
        outputFileSyncMock.mockRestore();
        existsSyncSpy.mockRestore();
    });

    it('findByCTId delegates to findByAttribute("id", value)', () => {
        const spy = jest.spyOn(db, 'findByAttribute').mockReturnValue({id: 'ct-42', name: 'Room A'});

        const result = db.findByCTId('ct-42');

        expect(spy).toHaveBeenCalledWith('id', 'ct-42');
        expect(result).toEqual({id: 'ct-42', name: 'Room A'});
    });

    it('findByCTId throws when no matching room config exists (findByAttribute\'s current not-found behavior)', () => {
        jest.spyOn(db, '_readFile').mockReturnValue({});

        expect(() => db.findByCTId('missing')).toThrow(/not found/);
    });
});
