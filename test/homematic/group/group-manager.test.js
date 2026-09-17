jest.mock('../../../src/db/pending-log.db', () => {
  // Deliberately mirrors the REAL PendingLogDB/JsonFileDB shape: save() and
  // deleteById() exist, but there is no delete() method. See the
  // "KNOWN BUG" test below.
  const instance = {save: jest.fn(), deleteById: jest.fn()};
  return {PendingLogDB: jest.fn(() => instance), __mockInstance: instance};
});

const {GroupManager} = require('../../../src/homematic/group/group-manager');
const {__mockInstance: pendingLogDbMock} = require('../../../src/db/pending-log.db');

describe('GroupManager', () => {
  const originalEnv = process.env.ENVIRONMENT;

  afterEach(() => {
    process.env.ENVIRONMENT = originalEnv;
    jest.clearAllMocks();
  });

  function makeRoomConfig(overrides = {}) {
    return {
      homematicId: 'group-1',
      desiredTemperatureIdle: 16,
      getDesiredRoomTemperatureForEvent: jest.fn().mockReturnValue(21),
      ...overrides,
    };
  }

  function makeGroupManager({roomConfiguration, groupState, setTemperatureForGroup}) {
    const homematicAPI = {
      setTemperatureForGroup: setTemperatureForGroup || jest.fn().mockResolvedValue(undefined),
    };
    return {
      groupManager: new GroupManager({roomConfiguration, roomState: groupState, homematicAPI}),
      homematicAPI,
    };
  }

  describe('setToIdle', () => {
    it('sets the room to its configured idle temperature', async () => {
      const roomConfiguration = makeRoomConfig();
      const {groupManager, homematicAPI} = makeGroupManager({
        roomConfiguration,
        groupState: {setTemperature: 21},
      });

      await groupManager.setToIdle('Bandprobe');

      expect(homematicAPI.setTemperatureForGroup).toHaveBeenCalledWith('group-1', 16);
      expect(pendingLogDbMock.save).toHaveBeenCalledWith(
          expect.objectContaining({id: 'group-1', eventName: 'Bandprobe'}),
      );
    });
  });

  describe('heatForEvent', () => {
    it('proceeds when the current set temperature already equals the idle temperature (no manual override)', async () => {
      const roomConfiguration = makeRoomConfig();
      const {groupManager, homematicAPI} = makeGroupManager({
        roomConfiguration,
        groupState: {setTemperature: 16},
      });

      await groupManager.heatForEvent({name: 'Gottesdienst'});

      expect(homematicAPI.setTemperatureForGroup).toHaveBeenCalledWith('group-1', 21);
    });

    it('proceeds when the current set temperature is undefined, regardless of environment', async () => {
      const roomConfiguration = makeRoomConfig();
      const {groupManager, homematicAPI} = makeGroupManager({
        roomConfiguration,
        groupState: {setTemperature: undefined},
      });

      await groupManager.heatForEvent({name: 'Gottesdienst'});

      expect(homematicAPI.setTemperatureForGroup).toHaveBeenCalledWith('group-1', 21);
    });

    it('blocks in production when the temperature was manually changed away from idle', async () => {
      process.env.ENVIRONMENT = 'production';
      const roomConfiguration = makeRoomConfig();
      const {groupManager, homematicAPI} = makeGroupManager({
        roomConfiguration,
        groupState: {setTemperature: 19},
      });

      await expect(groupManager.heatForEvent({name: 'Gottesdienst'})).rejects.toThrow('Blocked');
      expect(homematicAPI.setTemperatureForGroup).not.toHaveBeenCalled();
    });

    it('blocks outside production too, when the manually-changed temperature does not match the event target', async () => {
      process.env.ENVIRONMENT = 'development';
      const roomConfiguration = makeRoomConfig();
      const {groupManager, homematicAPI} = makeGroupManager({
        roomConfiguration,
        groupState: {setTemperature: 19},
      });

      await expect(groupManager.heatForEvent({name: 'Gottesdienst'})).rejects.toThrow('Blocked');
      expect(homematicAPI.setTemperatureForGroup).not.toHaveBeenCalled();
    });

    it('KNOWN QUIRK: outside production, assumes "no manual change" when setTemperature already equals the event target, and proceeds instead of blocking', async () => {
      process.env.ENVIRONMENT = 'development';
      const roomConfiguration = makeRoomConfig(); // getDesiredRoomTemperatureForEvent -> 21
      const {groupManager, homematicAPI} = makeGroupManager({
        roomConfiguration,
        groupState: {setTemperature: 21}, // differs from idle(16) but matches the event target
      });

      await groupManager.heatForEvent({name: 'Gottesdienst'});

      expect(homematicAPI.setTemperatureForGroup).toHaveBeenCalledWith('group-1', 21);
    });
  });

  describe('updateTemperature error handling', () => {
    it('FIXED (was: KNOWN BUG found during characterization): reverting the pending log on a failed API call now correctly calls pendingLogDb.deleteById() and surfaces "Cannot set Temperature to idle"', async () => {
      const roomConfiguration = makeRoomConfig();
      const setTemperatureForGroup = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      const {groupManager} = makeGroupManager({
        roomConfiguration,
        groupState: {setTemperature: 16},
        setTemperatureForGroup,
      });

      await expect(groupManager.setToIdle('Bandprobe')).rejects.toThrow('Cannot set Temperature to idle');
      expect(pendingLogDbMock.deleteById).toHaveBeenCalledWith('group-1');
    });
  });
});
