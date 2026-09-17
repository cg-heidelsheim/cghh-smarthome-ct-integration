const moment = require('moment');

const mockGetEvents = jest.fn();
jest.mock('../../src/churchtools/ct-api', () => {
  return jest.fn().mockImplementation(() => ({getEvents: mockGetEvents}));
});

jest.mock('../../src/homematic/group/group-state.builder', () => ({
  GroupStateBuilder: {dummyState: jest.fn()},
}));
jest.mock('../../src/homematic/group/group-manager.factory', () => ({
  GroupManagerFactory: {createGroupManager: jest.fn()},
}));
jest.mock('../../src/util/event.logger', () => ({
  EventLogger: {
    groupUpdatePreheat: jest.fn(),
    groupUpdatePreheatBlocked: jest.fn(),
    heatingTimeExpectancy: jest.fn(),
  },
}));

const {EventManager} = require('../../src/churchtools/event-manager');
const {GroupStateBuilder} = require('../../src/homematic/group/group-state.builder');
const {GroupManagerFactory} = require('../../src/homematic/group/group-manager.factory');
const {EventLogger} = require('../../src/util/event.logger');

describe('EventManager', () => {
  let lockDB;
  let roomConfigDB;
  let groupStateDB;
  let eventRoomConfigDB;
  let eventManager;

  beforeEach(() => {
    jest.clearAllMocks();
    lockDB = {tryGetById: jest.fn(), save: jest.fn()};
    roomConfigDB = {findByCTId: jest.fn()};
    groupStateDB = {tryGetById: jest.fn()};
    eventRoomConfigDB = {getAll: jest.fn().mockReturnValue([])};
    eventManager = new EventManager(lockDB, roomConfigDB, groupStateDB, eventRoomConfigDB);
  });

  function makeRoomConfig({
    name = 'Saal',
    homematicId = 'group-1',
    desiredTemperatureIdle = 16,
    minutesNeeded = 0,
    desiredTemperature = 21,
  } = {}) {
    return {
      name,
      homematicId,
      desiredTemperatureIdle,
      getMinutesNeededToReachTemperatureForEvent: jest.fn().mockReturnValue(minutesNeeded),
      getDesiredRoomTemperatureForEvent: jest.fn().mockReturnValue(desiredTemperature),
    };
  }

  function makeBooking(overrides = {}) {
    return {id: 'b1', resourceId: '1', statusId: '2', minPre: 0, ...overrides};
  }

  function makeEvent(overrides = {}) {
    return {
      name: 'Gottesdienst',
      startDate: moment().subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      endDate: moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      bookings: [],
      ...overrides,
    };
  }

  describe('handleEvent', () => {
    it('does nothing when the event has no bookings', async () => {
      const spy = jest.spyOn(eventManager, 'handleBookingOfEventHeating').mockResolvedValue(undefined);

      await eventManager.handleEvent(makeEvent({bookings: []}));

      expect(spy).not.toHaveBeenCalled();
    });

    it('handles every booking on the event, threading eventRoomConfigs through', async () => {
      const spy = jest.spyOn(eventManager, 'handleBookingOfEventHeating').mockResolvedValue(undefined);
      const bookingA = makeBooking({id: 'a'});
      const bookingB = makeBooking({id: 'b'});
      const event = makeEvent({bookings: [bookingA, bookingB]});
      const eventRoomConfigs = [{id: 'bandprobe', desiredTemperature: 18}];

      await eventManager.handleEvent(event, eventRoomConfigs);

      expect(spy).toHaveBeenCalledWith(event, bookingA, eventRoomConfigs);
      expect(spy).toHaveBeenCalledWith(event, bookingB, eventRoomConfigs);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleBookingOfEventHeating', () => {
    it('ignores the hard-coded "Küche" resource (id "4") before ever touching roomConfigDB', async () => {
      await eventManager.handleBookingOfEventHeating(makeEvent(), makeBooking({resourceId: '4'}));

      expect(roomConfigDB.findByCTId).not.toHaveBeenCalled();
    });

    it('logs and returns when the booked room has no matching room config', async () => {
      roomConfigDB.findByCTId.mockImplementation(() => {
        throw new Error('not found');
      });

      await eventManager.handleBookingOfEventHeating(makeEvent(), makeBooking());

      expect(lockDB.tryGetById).not.toHaveBeenCalled();
    });

    it('skips bookings that are not status "2" (accepted)', async () => {
      roomConfigDB.findByCTId.mockReturnValue(makeRoomConfig());

      await eventManager.handleBookingOfEventHeating(makeEvent(), makeBooking({statusId: '1'}));

      expect(lockDB.tryGetById).not.toHaveBeenCalled();
    });

    it('treats a found lock entry as "room is locked" and stops processing', async () => {
      roomConfigDB.findByCTId.mockReturnValue(makeRoomConfig());
      lockDB.tryGetById.mockReturnValue({id: 'group-1'}); // found -> locked

      await eventManager.handleBookingOfEventHeating(makeEvent(), makeBooking());

      expect(groupStateDB.tryGetById).not.toHaveBeenCalled();
    });

    it('treats a null lock lookup as "room is not locked" and continues', async () => {
      roomConfigDB.findByCTId.mockReturnValue(makeRoomConfig({minutesNeeded: 999}));
      lockDB.tryGetById.mockReturnValue(null);
      groupStateDB.tryGetById.mockReturnValue({id: 'group-1', label: 'Saal'});

      await eventManager.handleBookingOfEventHeating(makeEvent(), makeBooking());

      expect(groupStateDB.tryGetById).toHaveBeenCalledWith('group-1');
    });

    it('falls back to GroupStateBuilder.dummyState when groupStateDB has no entry yet', async () => {
      const roomConfig = makeRoomConfig({minutesNeeded: 999}); // -> shouldStartHeating stays false, easy to assert no crash
      roomConfigDB.findByCTId.mockReturnValue(roomConfig);
      lockDB.tryGetById.mockReturnValue(null);
      groupStateDB.tryGetById.mockReturnValue(null);
      GroupStateBuilder.dummyState.mockReturnValue({id: 'group-1', label: 'INIT'});

      await eventManager.handleBookingOfEventHeating(makeEvent(), makeBooking());

      expect(GroupStateBuilder.dummyState).toHaveBeenCalledWith('group-1');
    });

    it('starts heating, saves a lock, and logs when the schedule says heating should start now', async () => {
      const roomConfig = makeRoomConfig({homematicId: 'group-1', desiredTemperature: 21, minutesNeeded: 0});
      roomConfigDB.findByCTId.mockReturnValue(roomConfig);
      lockDB.tryGetById.mockReturnValue(null);
      groupStateDB.tryGetById.mockReturnValue({id: 'group-1', label: 'Saal'});

      const heatForEvent = jest.fn().mockResolvedValue(undefined);
      GroupManagerFactory.createGroupManager.mockReturnValue({heatForEvent, groupState: {label: 'Saal'}});

      const event = makeEvent();
      const eventRoomConfigs = [{id: 'bandprobe', desiredTemperature: 18}];
      await eventManager.handleBookingOfEventHeating(event, makeBooking(), eventRoomConfigs);

      expect(GroupManagerFactory.createGroupManager).toHaveBeenCalledWith('group-1');
      expect(heatForEvent).toHaveBeenCalledWith(event, eventRoomConfigs);
      expect(EventLogger.groupUpdatePreheat).toHaveBeenCalledWith('Saal', 21, event);
      expect(EventLogger.heatingTimeExpectancy).toHaveBeenCalled();
      expect(lockDB.save).toHaveBeenCalledWith(
          expect.objectContaining({id: 'group-1', eventName: event.name}),
      );
    });

    it('does not start heating (or save a lock) when the schedule says it is not time yet', async () => {
      const roomConfig = makeRoomConfig({homematicId: 'group-1', minutesNeeded: 0});
      roomConfigDB.findByCTId.mockReturnValue(roomConfig);
      lockDB.tryGetById.mockReturnValue(null);
      groupStateDB.tryGetById.mockReturnValue({id: 'group-1', label: 'Saal'});

      const event = makeEvent({startDate: moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss')});
      await eventManager.handleBookingOfEventHeating(event, makeBooking());

      expect(GroupManagerFactory.createGroupManager).not.toHaveBeenCalled();
      expect(lockDB.save).not.toHaveBeenCalled();
    });

    it('logs a "blocked" event instead of an error when heatForEvent rejects with "Blocked" (manual override)', async () => {
      const roomConfig = makeRoomConfig({homematicId: 'group-1', minutesNeeded: 0});
      roomConfigDB.findByCTId.mockReturnValue(roomConfig);
      lockDB.tryGetById.mockReturnValue(null);
      groupStateDB.tryGetById.mockReturnValue({id: 'group-1', label: 'Saal'});

      const heatForEvent = jest.fn().mockRejectedValue(new Error('Blocked'));
      GroupManagerFactory.createGroupManager.mockReturnValue({heatForEvent, groupState: {label: 'Saal'}});

      const event = makeEvent();
      await eventManager.handleBookingOfEventHeating(event, makeBooking());

      expect(EventLogger.groupUpdatePreheatBlocked).toHaveBeenCalledWith(event.name, 'Saal');
      expect(lockDB.save).not.toHaveBeenCalled();
    });

    it('does not save a lock when heatForEvent rejects with a non-"Blocked" error', async () => {
      const roomConfig = makeRoomConfig({homematicId: 'group-1', minutesNeeded: 0});
      roomConfigDB.findByCTId.mockReturnValue(roomConfig);
      lockDB.tryGetById.mockReturnValue(null);
      groupStateDB.tryGetById.mockReturnValue({id: 'group-1', label: 'Saal'});

      const heatForEvent = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      GroupManagerFactory.createGroupManager.mockReturnValue({heatForEvent, groupState: {label: 'Saal'}});

      await eventManager.handleBookingOfEventHeating(makeEvent(), makeBooking());

      expect(EventLogger.groupUpdatePreheatBlocked).not.toHaveBeenCalled();
      expect(lockDB.save).not.toHaveBeenCalled();
    });
  });

  describe('handleEvents', () => {
    it('fetches events from ChurchTools, filters to current/upcoming, and hands each to handleEvent', async () => {
      const spy = jest.spyOn(eventManager, 'handleEvent').mockResolvedValue(undefined);
      const upcoming = makeEvent({
        name: 'Upcoming',
        startDate: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment().add(90, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
      });
      const past = makeEvent({
        name: 'Past',
        startDate: moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment().subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
      });
      mockGetEvents.mockResolvedValue([past, upcoming]);
      const eventRoomConfigs = [{id: 'bandprobe', desiredTemperature: 18}];
      eventRoomConfigDB.getAll.mockReturnValue(eventRoomConfigs);

      await eventManager.handleEvents();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(upcoming, eventRoomConfigs);
    });
  });
});
