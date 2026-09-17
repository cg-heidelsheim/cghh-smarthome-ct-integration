const {HMIPWSMessage} = require('../../../../src/homematic/ws/model/hmip-ws-message');
const {HMIPWSGroupChangedEvent} = require('../../../../src/homematic/ws/model/event/hmip-ws-event-group-changed');
const {HMIPWSHeatingGroup} = require('../../../../src/homematic/ws/model/group/hmip-ws-group-heating');

describe('HMIPWSMessage.fromJson', () => {
  it('throws when json is missing or not an object', () => {
    expect(() => HMIPWSMessage.fromJson(undefined)).toThrow('HMIPWSMessage.fromJson: invalid json');
    expect(() => HMIPWSMessage.fromJson('not an object')).toThrow('HMIPWSMessage.fromJson: invalid json');
  });

  it('parses origin, accessPointId, and timestamp', () => {
    const message = HMIPWSMessage.fromJson({
      events: {},
      origin: {originType: 'DEVICE', id: 'client-1'},
      accessPointId: 'ap-1',
      timestamp: 1700000000,
    });

    expect(message.origin.originType).toBe('DEVICE');
    expect(message.origin.id).toBe('client-1');
    expect(message.accessPointId).toBe('ap-1');
    expect(message.timestamp).toBe(1700000000);
  });

  it('defaults to an empty events array when the payload has no events object', () => {
    const message = HMIPWSMessage.fromJson({origin: {originType: 'DEVICE', id: 'client-1'}});

    expect(message.events).toEqual([]);
  });

  it('dispatches each event in the events map through the real event factory, end-to-end', () => {
    const message = HMIPWSMessage.fromJson({
      origin: {originType: 'GROUP', id: 'client-1'},
      accessPointId: 'ap-1',
      timestamp: 1700000000,
      events: {
        'evt-1': {
          pushEventType: 'GROUP_CHANGED',
          group: {
            id: 'group-1',
            homeId: 'home-1',
            label: 'Saal',
            type: 'HEATING',
            lastStatusUpdate: 1700000000,
            actualTemperature: 19.5,
            setPointTemperature: 21,
            humidity: 45,
          },
        },
      },
    });

    expect(message.events).toHaveLength(1);
    expect(message.events[0]).toBeInstanceOf(HMIPWSGroupChangedEvent);
    expect(message.events[0].group).toBeInstanceOf(HMIPWSHeatingGroup);
    expect(message.events[0].group.label).toBe('Saal');
  });

  it('leaves an unrecognized event type as undefined in the events array rather than throwing', () => {
    const message = HMIPWSMessage.fromJson({
      origin: {originType: 'DEVICE', id: 'client-1'},
      events: {'evt-1': {pushEventType: 'SOME_FUTURE_EVENT_TYPE'}},
    });

    expect(message.events).toEqual([undefined]);
  });
});
