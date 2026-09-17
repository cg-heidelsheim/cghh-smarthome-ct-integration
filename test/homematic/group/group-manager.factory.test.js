function makeSharedInstanceMock(methods) {
  const instance = {};
  for (const name of methods) {
    instance[name] = jest.fn();
  }
  return {instance, Ctor: jest.fn(() => instance)};
}

const groupStateDBMock = makeSharedInstanceMock(['getById']);
jest.mock('../../../src/db/group-state.db', () => ({GroupStateDB: groupStateDBMock.Ctor}));

const roomConfigDBMock = makeSharedInstanceMock(['getById']);
jest.mock('../../../src/db/room-config.db', () => ({RoomConfigDB: roomConfigDBMock.Ctor}));

jest.mock('../../../src/homematic/homematic-api', () => ({
  HomematicApi: jest.fn().mockImplementation(() => ({setTemperatureForGroup: jest.fn()})),
}));

const {GroupManagerFactory} = require('../../../src/homematic/group/group-manager.factory');
const {GroupManager} = require('../../../src/homematic/group/group-manager');

describe('GroupManagerFactory.createGroupManager', () => {
  afterEach(() => jest.clearAllMocks());

  it('builds a GroupManager wired to the matching room config, group state, and a fresh HomematicApi', () => {
    const roomConfig = {homematicId: 'group-1'};
    const groupState = {id: 'group-1', label: 'Saal'};
    roomConfigDBMock.instance.getById.mockReturnValue(roomConfig);
    groupStateDBMock.instance.getById.mockReturnValue(groupState);

    const groupManager = GroupManagerFactory.createGroupManager('group-1');

    expect(roomConfigDBMock.instance.getById).toHaveBeenCalledWith('group-1');
    expect(groupStateDBMock.instance.getById).toHaveBeenCalledWith('group-1');
    expect(groupManager).toBeInstanceOf(GroupManager);
    expect(groupManager.roomConfiguration).toBe(roomConfig);
    expect(groupManager.groupState).toBe(groupState);
    expect(typeof groupManager.homematicAPI.setTemperatureForGroup).toBe('function');
  });

  it('propagates the error when the room id has no matching config', () => {
    roomConfigDBMock.instance.getById.mockImplementation(() => {
      throw new Error('not found');
    });

    expect(() => GroupManagerFactory.createGroupManager('missing')).toThrow('not found');
  });
});
