const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { RoomConfigDB } = require('../../src/db/room-config.db.js');
const { RoomConfig } = require('../../src/db/model/room-config');

const mockFilePath = path.join(process.cwd(), 'config', 'room.config.json');

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

describe('RoomConfigurationDB', () => {
    let db;
    let room;

    beforeEach(() => {
        db = new RoomConfigDB();
        room = new RoomConfig();

        room.id = 'room-123';
        room.name = 'Test Room Configuration';

        for (const key in memoryFileStore) delete memoryFileStore[key];
        fse.outputFileSync.mockClear();
        fs.readFileSync.mockClear();
    });

    afterAll(() => {
        fs.readFileSync.mockRestore();
    });

    test('getAll returns all rooms as RoomConfiguration instances', () => {
        const sampleRooms = {
            'room1': { id: 'room1', name: 'Main Hall' },
            'room2': { id: 'room2', name: 'Conference Room' }
        };
        memoryFileStore[mockFilePath] = JSON.stringify(sampleRooms);

        const allRooms = db.getAll();
        expect(allRooms).toHaveLength(2);
        allRooms.forEach(room => {
            expect(room).toBeInstanceOf(RoomConfig);
            expect(room.id).toBeDefined();
        });
    });

    test('getById returns the correct room', () => {
        const sampleRooms = {
            'room1': { id: 'room1', name: 'Main Hall' },
            'room2': { id: 'room2', name: 'Conference Room' }
        };
        memoryFileStore[mockFilePath] = JSON.stringify(sampleRooms);

        const room = db.getById('room1');
        expect(room).toBeInstanceOf(RoomConfig);
        expect(room.id).toBe('room1');
    });

    test('getById throws if room does not exist', () => {
        memoryFileStore[mockFilePath] = JSON.stringify({});
        expect(() => db.getById('nonexistent')).toThrow(/Entry with id nonexistent not found in DB./);
    });

    test('_readFile throws error if file missing or unreadable', () => {
        delete memoryFileStore[mockFilePath];
        expect(() => db._readFile()).toThrow(/Failed to read or parse/);
    });
});
