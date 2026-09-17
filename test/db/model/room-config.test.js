const {RoomConfig} = require('../../../src/db/model/room-config');

function makeRoomConfig(overrides = {}) {
  return Object.assign(new RoomConfig(), {
    desiredTemperature: 21,
    desiredTemperatureIdle: 16,
    heatingRate: 5,
    spinUpTime: 10,
    ...overrides,
  });
}

describe('RoomConfig (pure model, no I/O)', () => {
  describe('getDesiredRoomTemperatureForEvent', () => {
    it('returns the room default temperature when no eventRoomConfig matches the event name', () => {
      const roomConfig = makeRoomConfig({desiredTemperature: 21});
      const event = {name: 'Gottesdienst'};

      expect(roomConfig.getDesiredRoomTemperatureForEvent(event, [])).toBe(21);
    });

    it('overrides the default temperature on a case-insensitive partial name match', () => {
      const roomConfig = makeRoomConfig({desiredTemperature: 21});
      const event = {name: 'Sonntags-BANDPROBE Abend'};
      const eventRoomConfigs = [{id: 'bandprobe', desiredTemperature: 18}];

      expect(roomConfig.getDesiredRoomTemperatureForEvent(event, eventRoomConfigs)).toBe(18);
    });

    it('applies the last matching config when multiple configs match', () => {
      const roomConfig = makeRoomConfig({desiredTemperature: 21});
      const event = {name: 'bandprobe gottesdienst'};
      const eventRoomConfigs = [
        {id: 'bandprobe', desiredTemperature: 18},
        {id: 'gottesdienst', desiredTemperature: 20},
      ];

      expect(roomConfig.getDesiredRoomTemperatureForEvent(event, eventRoomConfigs)).toBe(20);
    });

    it('performs no I/O - does not require a database at all', () => {
      const roomConfig = makeRoomConfig();
      expect(() => roomConfig.getDesiredRoomTemperatureForEvent({name: 'x'}, [])).not.toThrow();
    });
  });

  describe('getMinutesNeededToReachTemperatureForEvent', () => {
    it('returns 120 (fallback) when the current room temperature is not present', () => {
      const roomConfig = makeRoomConfig();
      const result = roomConfig.getMinutesNeededToReachTemperatureForEvent({name: 'x'}, {temperature: undefined}, []);
      expect(result).toBe(120);
    });

    it('returns 0 when the room is already at or above the desired temperature', () => {
      const roomConfig = makeRoomConfig({desiredTemperature: 18});
      const result = roomConfig.getMinutesNeededToReachTemperatureForEvent({name: 'x'}, {temperature: 20}, []);
      expect(result).toBe(0);
    });

    it('computes spinUpTime + degreeDifference * heatingRate', () => {
      const roomConfig = makeRoomConfig({desiredTemperature: 21, heatingRate: 5, spinUpTime: 10});
      const result = roomConfig.getMinutesNeededToReachTemperatureForEvent({name: 'x'}, {temperature: 19}, []);
      // spinUpTime(10) + (21 - 19) * heatingRate(5) = 20
      expect(result).toBe(20);
    });

    it('respects an eventRoomConfigs override when computing the target temperature', () => {
      const roomConfig = makeRoomConfig({desiredTemperature: 21, heatingRate: 5, spinUpTime: 10});
      const eventRoomConfigs = [{id: 'bandprobe', desiredTemperature: 18}];
      const result = roomConfig.getMinutesNeededToReachTemperatureForEvent(
          {name: 'Bandprobe'}, {temperature: 16}, eventRoomConfigs
      );
      // desired becomes 18 (override) instead of 21: 10 + (18 - 16) * 5 = 20
      expect(result).toBe(20);
    });
  });
});
