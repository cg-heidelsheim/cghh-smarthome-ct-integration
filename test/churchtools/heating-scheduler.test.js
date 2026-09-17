const moment = require('moment');
const {HeatingScheduler} = require('../../src/churchtools/heating-scheduler');

describe('HeatingScheduler.calculateHeatingSchedule', () => {
  const NOW = new Date('2024-01-15T10:00:00');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function makeRoomConfig(minutesNeeded) {
    return {
      getMinutesNeededToReachTemperatureForEvent: jest.fn().mockReturnValue(minutesNeeded),
    };
  }

  it('signals heating should start when the computed heating-start time has already passed', () => {
    const roomConfig = makeRoomConfig(20);
    const event = {startDate: moment(NOW).add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss')};
    const booking = {minPre: 0};

    const result = HeatingScheduler.calculateHeatingSchedule(roomConfig, event, {}, booking);

    expect(result.shouldStartHeating).toBe(true);
    expect(result.minutesToReachTemp).toBe(20);
    expect(result.minutesUntilHeatingStart).toBe(-10);
  });

  it('signals heating should not start yet when the heating-start time is still in the future', () => {
    const roomConfig = makeRoomConfig(20);
    const event = {startDate: moment(NOW).add(60, 'minutes').format('YYYY-MM-DD HH:mm:ss')};
    const booking = {minPre: 0};

    const result = HeatingScheduler.calculateHeatingSchedule(roomConfig, event, {}, booking);

    expect(result.shouldStartHeating).toBe(false);
    expect(result.minutesUntilHeatingStart).toBe(40);
  });

  it('treats a heating-start time exactly equal to now as "should start" (isSameOrBefore boundary)', () => {
    const roomConfig = makeRoomConfig(20);
    const event = {startDate: moment(NOW).add(20, 'minutes').format('YYYY-MM-DD HH:mm:ss')};
    const booking = {minPre: 0};

    const result = HeatingScheduler.calculateHeatingSchedule(roomConfig, event, {}, booking);

    expect(result.shouldStartHeating).toBe(true);
    expect(result.minutesUntilHeatingStart).toBe(0);
  });

  it('defaults minutesPreOfBooking to 0 when booking.minPre is undefined (?? operator)', () => {
    const roomConfig = makeRoomConfig(15.4);
    const event = {startDate: moment(NOW).add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss')};
    const booking = {};

    const result = HeatingScheduler.calculateHeatingSchedule(roomConfig, event, {}, booking);

    expect(result.minutesPreOfBooking).toBe(0);
    expect(result.minutesToReachTemp).toBe(15); // Math.round(15.4) + 0
  });

  it('rounds minutesToReachTemp before adding minutesPreOfBooking on top', () => {
    const roomConfig = makeRoomConfig(15.4);
    const event = {startDate: moment(NOW).add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss')};
    const booking = {minPre: 5};

    const result = HeatingScheduler.calculateHeatingSchedule(roomConfig, event, {}, booking);

    expect(result.minutesToReachTemp).toBe(20); // Math.round(15.4) + 5
  });

  it('passes event, groupState, and eventRoomConfigs through to roomConfig.getMinutesNeededToReachTemperatureForEvent', () => {
    const roomConfig = makeRoomConfig(10);
    const event = {startDate: moment(NOW).add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss')};
    const groupState = {temperature: 18};
    const booking = {minPre: 0};
    const eventRoomConfigs = [{id: 'bandprobe', desiredTemperature: 18}];

    HeatingScheduler.calculateHeatingSchedule(roomConfig, event, groupState, booking, eventRoomConfigs);

    expect(roomConfig.getMinutesNeededToReachTemperatureForEvent).toHaveBeenCalledWith(event, groupState, eventRoomConfigs);
  });
});
