// jest.mock is not hoisted here (this repo's jest transform doesn't run plain .js
// test files through babel-jest, so no babel-plugin-jest-hoist) — it must appear
// textually before any require() of the mocked module.
jest.mock('../../src/db/pending-log.db', () => ({
    PendingLogDB: jest.fn(),
}));

const {EventLogger} = require('../../src/util/event.logger');
const {Logger} = require('../../src/util/logger');
const {PendingLogDB} = require('../../src/db/pending-log.db');

// The global jest-logger-mock.js only stubs info/error/warn/debug, not core/trace
// (src/util/logger.js's real API includes both). EventLogger logs "core" messages
// heavily, so extend the shared mock here rather than duplicating the global mock.
if (!jest.isMockFunction(Logger.core)) {
    Logger.core = jest.fn();
}
if (!jest.isMockFunction(Logger.trace)) {
    Logger.trace = jest.fn();
}

describe('EventLogger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('wsDeviceUpdateDebug (fixed in Phase 2 — was: `channel.index = channelIndex` assignment instead of comparison inside .find())', () => {
        it('does not mutate any channel\'s .index', () => {
            const currentState = {
                label: 'Thermostat A',
                channels: [
                    {index: 0, setTemperature: 20},
                    {index: 1, setTemperature: 21},
                ],
            };
            const updatedState = {
                label: 'Thermostat A',
                channels: [
                    {index: 0, setTemperature: 20},
                    {index: 1, setTemperature: 22},
                ],
            };

            EventLogger.wsDeviceUpdateDebug(currentState, updatedState, 1);

            expect(currentState.channels[0].index).toBe(0);
            expect(updatedState.channels[0].index).toBe(0);
        });

        it('resolves to the channel actually matching the requested index, not always the first one', () => {
            const currentState = {
                label: 'Thermostat A',
                channels: [
                    {index: 0, temperature: 19.9},
                    {index: 1, temperature: 21.1},
                ],
            };
            const updatedState = {
                label: 'Thermostat A',
                channels: [
                    {index: 0, temperature: 19.9},
                    {index: 1, temperature: 21.4},
                ],
            };

            EventLogger.wsDeviceUpdateDebug(currentState, updatedState, 1);

            const debugCalls = Logger.debug.mock.calls.map(([arg]) => arg);
            const postCall = debugCalls.find(c => c.tags?.snapshot === 'POST');
            expect(postCall.message).toContain('CurrTemp: 21.4');
            expect(postCall.tags.channel).toBe(1);
        });

        it('requesting channelIndex 0 now correctly finds the channel at index 0', () => {
            const currentState = {label: 'Thermostat A', channels: [{index: 0, temperature: 18}, {index: 1}]};
            const updatedState = {label: 'Thermostat A', channels: [{index: 0, temperature: 18.5}, {index: 1}]};

            EventLogger.wsDeviceUpdateDebug(currentState, updatedState, 0);

            const debugCalls = Logger.debug.mock.calls.map(([arg]) => arg);
            const postCall = debugCalls.find(c => c.tags?.snapshot === 'POST');
            expect(postCall.tags.channel).toBe(0);
            expect(postCall.message).toContain('CurrTemp: 18.5');
        });

        it('skips the PRE log (rather than crashing) when the requested channel index is not present in the current state', () => {
            const currentState = {label: 'Thermostat A', channels: [{index: 0}]}; // no channel 1 yet
            const updatedState = {label: 'Thermostat A', channels: [{index: 0}, {index: 1, temperature: 20}]};

            expect(() => EventLogger.wsDeviceUpdateDebug(currentState, updatedState, 1)).not.toThrow();

            const debugCalls = Logger.debug.mock.calls.map(([arg]) => arg);
            expect(debugCalls.some(c => c.tags?.snapshot === 'PRE')).toBe(false);
            expect(debugCalls.some(c => c.tags?.snapshot === 'POST')).toBe(true);
        });
    });

    describe('isInitialUpdate branching (label === "INIT")', () => {
        it('wsGroupChangeDebug skips the PRE log and logs INIT instead of POST when currentState.label is INIT', () => {
            const currentState = {label: 'INIT', setTemperature: 20};
            const updatedState = {label: 'Room A', setTemperature: 21};

            EventLogger.wsGroupChangeDebug(currentState, updatedState);

            expect(Logger.debug).toHaveBeenCalledTimes(1);
            expect(Logger.debug.mock.calls[0][0].tags.snapshot).toBe('INIT');
        });

        it('wsGroupChangeDebug logs both PRE and POST when not an initial update', () => {
            const currentState = {label: 'Room A', setTemperature: 20};
            const updatedState = {label: 'Room A', setTemperature: 21};

            EventLogger.wsGroupChangeDebug(currentState, updatedState);

            expect(Logger.debug).toHaveBeenCalledTimes(2);
            expect(Logger.debug.mock.calls[0][0].tags.snapshot).toBe('PRE');
            expect(Logger.debug.mock.calls[1][0].tags.snapshot).toBe('POST');
        });

        it('weatherUpdateDebug skips PRE and logs INIT for an initial update', () => {
            const currentState = {label: 'INIT', temperature: 1, minTemperature: 1, maxTemperature: 1, humidity: 1, windSpeed: 1, vaporAmount: 1, weatherCondition: 'CLEAR', weatherDayTime: 'DAY'};
            const updatedState = {...currentState, label: 'Home'};

            EventLogger.weatherUpdateDebug(currentState, updatedState);

            expect(Logger.debug).toHaveBeenCalledTimes(1);
            expect(Logger.debug.mock.calls[0][0].tags.snapshot).toBe('INIT');
        });
    });

    describe('wsGroupChangeCore', () => {
        it('does nothing when setTemperature is unchanged', () => {
            const currentState = {id: '1', label: 'Room A', setTemperature: 20};
            const updatedState = {id: '1', label: 'Room A', setTemperature: 20};

            EventLogger.wsGroupChangeCore(currentState, updatedState);

            expect(Logger.core).not.toHaveBeenCalled();
        });

        it('logs a MANU change and does not touch PendingLogDB when no pending log exists', () => {
            PendingLogDB.mockImplementation(() => ({
                tryGetById: jest.fn(() => null),
                deleteById: jest.fn(),
            }));

            const currentState = {id: '1', label: 'Room A', setTemperature: 20};
            const updatedState = {id: '1', label: 'Room A', setTemperature: 22};

            EventLogger.wsGroupChangeCore(currentState, updatedState);

            expect(Logger.core).toHaveBeenCalledTimes(1);
            expect(Logger.core.mock.calls[0][0].tags.type).toBe('MANU');
        });

        it('logs an AUTO change and resolves the pending log when one exists', () => {
            const deleteById = jest.fn();
            PendingLogDB.mockImplementation(() => ({
                tryGetById: jest.fn(() => ({eventName: 'Bandprobe'})),
                deleteById,
            }));

            const currentState = {id: '1', label: 'Room A', setTemperature: 16};
            const updatedState = {id: '1', label: 'Room A', setTemperature: 21};

            EventLogger.wsGroupChangeCore(currentState, updatedState);

            expect(Logger.core.mock.calls[0][0].tags.type).toBe('AUTO');
            expect(deleteById).toHaveBeenCalledWith('1');
        });

        it('FIXED: falls back to MANU (without crashing) when the pending-log DB read genuinely fails', () => {
            PendingLogDB.mockImplementation(() => ({
                tryGetById: jest.fn(() => {
                    throw new Error('corrupt file');
                }),
                deleteById: jest.fn(),
            }));

            const currentState = {id: '1', label: 'Room A', setTemperature: 20};
            const updatedState = {id: '1', label: 'Room A', setTemperature: 22};

            expect(() => EventLogger.wsGroupChangeCore(currentState, updatedState)).not.toThrow();

            expect(Logger.core.mock.calls[0][0].tags.type).toBe('MANU');
        });
    });

    describe('cron-narration core log methods (basic call shape)', () => {
        it('heatingTimeExpectancy logs via Logger.core', () => {
            EventLogger.heatingTimeExpectancy(30, 5, {label: 'Room A'});
            expect(Logger.core).toHaveBeenCalledTimes(1);
        });

        it('resolveLock logs via Logger.core', () => {
            EventLogger.resolveLock('Room A', 16, {eventName: 'Bandprobe', expiring: '2024-01-01T10:00:00Z'});
            expect(Logger.core).toHaveBeenCalledTimes(1);
        });

        it('groupUpdatePreheat logs via Logger.core', () => {
            EventLogger.groupUpdatePreheat('Room A', 21, {name: 'Bandprobe', startDate: '2024-01-01T10:00:00Z'});
            expect(Logger.core).toHaveBeenCalledTimes(1);
        });

        it('groupUpdatePreheatBlocked logs via Logger.core', () => {
            EventLogger.groupUpdatePreheatBlocked('Bandprobe', 'Room A');
            expect(Logger.core).toHaveBeenCalledTimes(1);
        });
    });
});
