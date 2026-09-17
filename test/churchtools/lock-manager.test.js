jest.mock('../../src/homematic/group/group-manager.factory', () => ({
  GroupManagerFactory: {createGroupManager: jest.fn()},
}));
jest.mock('../../src/util/event.logger', () => ({
  EventLogger: {resolveLock: jest.fn()},
}));

const {LockManager} = require('../../src/churchtools/lock-manager');
const {GroupManagerFactory} = require('../../src/homematic/group/group-manager.factory');
const {EventLogger} = require('../../src/util/event.logger');

describe('LockManager', () => {
  let lockDB;
  let roomConfigDB;
  let lockManager;

  beforeEach(() => {
    jest.clearAllMocks();
    lockDB = {
      getAll: jest.fn(),
      deleteById: jest.fn(),
    };
    roomConfigDB = {
      getById: jest.fn(),
    };
    lockManager = new LockManager(lockDB, roomConfigDB);
  });

  function makeLock({id = 'group-1', eventName = 'Bandprobe', expired}) {
    return {id, eventName, isExpired: jest.fn().mockReturnValue(expired)};
  }

  function makeRoomConfig(name = 'Saal', desiredTemperatureIdle = 16) {
    return {name, desiredTemperatureIdle};
  }

  it('processes every lock returned by lockDB.getAll()', async () => {
    const lockA = makeLock({id: 'a', expired: false});
    const lockB = makeLock({id: 'b', expired: false});
    lockDB.getAll.mockReturnValue([lockA, lockB]);
    roomConfigDB.getById.mockReturnValue(makeRoomConfig());

    await lockManager.manageLocks();

    expect(roomConfigDB.getById).toHaveBeenCalledWith('a');
    expect(roomConfigDB.getById).toHaveBeenCalledWith('b');
  });

  it('does nothing for a lock that is not expired', async () => {
    const lock = makeLock({expired: false});
    lockDB.getAll.mockReturnValue([lock]);
    roomConfigDB.getById.mockReturnValue(makeRoomConfig());

    await lockManager.manageLocks();

    expect(GroupManagerFactory.createGroupManager).not.toHaveBeenCalled();
    expect(lockDB.deleteById).not.toHaveBeenCalled();
    expect(EventLogger.resolveLock).not.toHaveBeenCalled();
  });

  it('resolves an expired lock: sets the group to idle, deletes the lock, and logs the resolution', async () => {
    const lock = makeLock({id: 'group-1', eventName: 'Bandprobe', expired: true});
    const roomConfig = makeRoomConfig('Saal', 16);
    lockDB.getAll.mockReturnValue([lock]);
    roomConfigDB.getById.mockReturnValue(roomConfig);

    const setToIdle = jest.fn().mockResolvedValue(undefined);
    const groupManager = {setToIdle, groupState: {label: 'Saal'}};
    GroupManagerFactory.createGroupManager.mockReturnValue(groupManager);

    await lockManager.manageLocks();

    expect(GroupManagerFactory.createGroupManager).toHaveBeenCalledWith('group-1');
    expect(setToIdle).toHaveBeenCalledWith('Bandprobe');
    expect(lockDB.deleteById).toHaveBeenCalledWith('group-1');
    expect(EventLogger.resolveLock).toHaveBeenCalledWith('Saal', 16, lock);
  });

  it('KNOWN BEHAVIOR: swallows errors from setToIdle instead of rethrowing (the throw in source is commented out)', async () => {
    const lock = makeLock({id: 'group-1', expired: true});
    roomConfigDB.getById.mockReturnValue(makeRoomConfig('Saal', 16));

    const setToIdle = jest.fn().mockRejectedValue(new Error('homematic unreachable'));
    GroupManagerFactory.createGroupManager.mockReturnValue({setToIdle, groupState: {label: 'Saal'}});
    lockDB.getAll.mockReturnValue([lock]);

    await expect(lockManager.manageLocks()).resolves.toBeUndefined();

    // Because the error is swallowed, the lock is never deleted and never resolved-logged.
    // This is a pre-existing gap: a persistently-failing groupManager.setToIdle leaves the
    // expired lock in place forever, retried every cron tick, with no escalation.
    expect(lockDB.deleteById).not.toHaveBeenCalled();
    expect(EventLogger.resolveLock).not.toHaveBeenCalled();
  });
});
