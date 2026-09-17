function makeSharedInstanceMock(methods) {
  const instance = {};
  for (const name of methods) {
    instance[name] = jest.fn();
  }
  return {instance, Ctor: jest.fn(() => instance)};
}

// Shared-instance module mocks: every `new X()` anywhere in the code under test
// resolves to the SAME mock object, so tests can configure/assert on it directly
// regardless of how many places construct it.
const roomConfigDBMock = makeSharedInstanceMock(['getAll', 'getById', 'findByCTId']);
jest.mock('../../src/db/room-config.db', () => ({RoomConfigDB: roomConfigDBMock.Ctor}));

const lockDBMock = makeSharedInstanceMock(['getAll', 'getById', 'tryGetById', 'deleteById', 'save']);
jest.mock('../../src/db/lock.db', () => ({LockDB: lockDBMock.Ctor}));

const groupStateDBMock = makeSharedInstanceMock(['getAll', 'getById']);
jest.mock('../../src/db/group-state.db', () => ({GroupStateDB: groupStateDBMock.Ctor}));

const homematicApiMock = makeSharedInstanceMock(['setTemperatureForGroup']);
jest.mock('../../src/homematic/homematic-api', () => ({HomematicApi: homematicApiMock.Ctor}));

const lockManagerMock = makeSharedInstanceMock(['manageLocks']);
jest.mock('../../src/churchtools/lock-manager', () => ({LockManager: lockManagerMock.Ctor}));

const eventManagerMock = makeSharedInstanceMock(['handleEvents']);
jest.mock('../../src/churchtools/event-manager', () => ({EventManager: eventManagerMock.Ctor}));

// Plain `() => ({Uptime: {pingUptime: jest.fn()}})` would create a NEW jest.fn()
// every time the mocked module is re-required after jest.resetModules() below,
// leaving this file's `Uptime` reference (captured once, at load time) pointing at
// a stale mock the SUT no longer uses. Close over one persistent object instead.
const uptimeMock = {pingUptime: jest.fn()};
jest.mock('../../uptime', () => ({Uptime: uptimeMock}));

const environmentManagerMock = {updateServerVariables: jest.fn()};
jest.mock('../../src/util/environment-manager', () => ({EnvironmentManager: environmentManagerMock}));

const {Uptime} = require('../../uptime');

describe('churchtools-event-cron', () => {
  let execute;
  let resetEverythingIfNotLocked;
  let executeCron;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:30:00')); // not midnight, by default

    lockManagerMock.instance.manageLocks.mockResolvedValue(undefined);
    eventManagerMock.instance.handleEvents.mockResolvedValue(undefined);
    homematicApiMock.instance.setTemperatureForGroup.mockResolvedValue(undefined);
    environmentManagerMock.updateServerVariables.mockResolvedValue(undefined);

    ({execute, resetEverythingIfNotLocked, executeCron} = require('../../src/churchtools/churchtools-event-cron'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('execute', () => {
    it('runs lock management before event management, in order', async () => {
      const callOrder = [];
      lockManagerMock.instance.manageLocks.mockImplementation(async () => {
        callOrder.push('locks');
      });
      eventManagerMock.instance.handleEvents.mockImplementation(async () => {
        callOrder.push('events');
      });

      await execute();

      expect(callOrder).toEqual(['locks', 'events']);
    });
  });

  describe('resetEverythingIfNotLocked', () => {
    it('FIXED (was: KNOWN BUG): no longer depends on execute() having run first — it builds its own RoomConfigDB/LockDB instead of reading a module-level singleton', async () => {
      roomConfigDBMock.instance.getAll.mockReturnValue([]);

      await expect(resetEverythingIfNotLocked({})).resolves.toEqual({});
    });

    it('resets a room that currently has no lock to its idle temperature', async () => {
      roomConfigDBMock.instance.getAll.mockReturnValue([
        {name: 'Saal', homematicId: 'group-1', desiredTemperatureIdle: 16},
      ]);
      lockDBMock.instance.tryGetById.mockReturnValue(null); // no lock found

      const result = await resetEverythingIfNotLocked({});

      expect(homematicApiMock.instance.setTemperatureForGroup).toHaveBeenCalledWith('group-1', 16);
      expect(result).toEqual({});
    });

    it('does not reset a room that currently has an active lock', async () => {
      roomConfigDBMock.instance.getAll.mockReturnValue([
        {name: 'Saal', homematicId: 'group-1', desiredTemperatureIdle: 16},
      ]);
      lockDBMock.instance.tryGetById.mockReturnValue({id: 'group-1'}); // found -> locked

      const result = await resetEverythingIfNotLocked({});

      expect(homematicApiMock.instance.setTemperatureForGroup).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('marks a room as reset-not-possible and pings Uptime when the Homematic API call fails', async () => {
      roomConfigDBMock.instance.getAll.mockReturnValue([
        {name: 'Saal', homematicId: 'group-1', desiredTemperatureIdle: 16, homematicName: 'Saal HMIP'},
      ]);
      lockDBMock.instance.tryGetById.mockReturnValue(null);
      homematicApiMock.instance.setTemperatureForGroup.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await resetEverythingIfNotLocked({});

      expect(result).toEqual({'group-1': true});
      expect(Uptime.pingUptime).toHaveBeenCalledWith('down', expect.any(String), 'CRON');
    });

    it('on retry, skips rooms that already succeeded and only retries rooms still marked reset-not-possible', async () => {
      roomConfigDBMock.instance.getAll.mockReturnValue([
        {name: 'Saal', homematicId: 'group-1', desiredTemperatureIdle: 16},
        {name: 'Kueche', homematicId: 'group-2', desiredTemperatureIdle: 16},
      ]);
      lockDBMock.instance.tryGetById.mockReturnValue(null);

      const earlierResetNotPossible = {'group-2': true}; // group-1 already succeeded earlier

      await resetEverythingIfNotLocked(earlierResetNotPossible);

      expect(homematicApiMock.instance.setTemperatureForGroup).not.toHaveBeenCalledWith('group-1', 16);
      expect(homematicApiMock.instance.setTemperatureForGroup).toHaveBeenCalledWith('group-2', 16);
    });
  });

  describe('executeCron (moved here from index.ts, previously untestable)', () => {
    it('outside the midnight window, skips the nightly-reset loop entirely and just runs execute()', async () => {
      // system time set to 10:30 in beforeEach - not midnight
      roomConfigDBMock.instance.getAll.mockReturnValue([]);

      await executeCron();

      expect(environmentManagerMock.updateServerVariables).not.toHaveBeenCalled();
      expect(lockManagerMock.instance.manageLocks).toHaveBeenCalled();
      expect(eventManagerMock.instance.handleEvents).toHaveBeenCalled();
      expect(Uptime.pingUptime).toHaveBeenCalledWith('up', 'OK', 'CRON');
    });

    it('at exactly HH:00, runs the nightly-reset loop before execute()', async () => {
      jest.setSystemTime(new Date('2024-01-15T00:00:00'));
      roomConfigDBMock.instance.getAll.mockReturnValue([
        {name: 'Saal', homematicId: 'group-1', desiredTemperatureIdle: 16},
      ]);
      lockDBMock.instance.tryGetById.mockReturnValue(null);

      await executeCron();

      expect(homematicApiMock.instance.setTemperatureForGroup).toHaveBeenCalledWith('group-1', 16);
      expect(eventManagerMock.instance.handleEvents).toHaveBeenCalled();
      expect(Uptime.pingUptime).toHaveBeenCalledWith('up', 'OK', 'CRON');
    });

    it('retries the nightly reset up to 3 times, refreshing server URLs between attempts, and pings Uptime down after the 3rd failure', async () => {
      jest.setSystemTime(new Date('2024-01-15T00:00:00'));
      roomConfigDBMock.instance.getAll.mockReturnValue([
        {name: 'Saal', homematicId: 'group-1', desiredTemperatureIdle: 16, homematicName: 'Saal HMIP'},
      ]);
      lockDBMock.instance.tryGetById.mockReturnValue(null);
      homematicApiMock.instance.setTemperatureForGroup.mockRejectedValue(new Error('ECONNREFUSED'));

      await executeCron();

      expect(homematicApiMock.instance.setTemperatureForGroup).toHaveBeenCalledTimes(3);
      expect(environmentManagerMock.updateServerVariables).toHaveBeenCalledTimes(2); // between attempts 1->2 and 2->3, not after the 3rd
      expect(Uptime.pingUptime).toHaveBeenCalledWith('down', expect.anything(), 'CRON');
      // execute() still runs afterwards regardless of the reset outcome
      expect(eventManagerMock.instance.handleEvents).toHaveBeenCalled();
    });

    it('pings Uptime down (without throwing) when execute() itself fails', async () => {
      roomConfigDBMock.instance.getAll.mockReturnValue([]);
      eventManagerMock.instance.handleEvents.mockRejectedValue(new Error('ChurchTools unreachable'));

      await expect(executeCron()).resolves.toBeUndefined();

      expect(Uptime.pingUptime).toHaveBeenCalledWith('down', expect.anything(), 'CRON');
    });
  });
});
