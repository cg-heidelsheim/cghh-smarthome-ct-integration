const { createEventFromJson } = require('../../../../../src/homematic/ws/model/event/hmip-ws-event-factory');
const { HMIPWSDeviceChangedEvent } = require('../../../../../src/homematic/ws/model/event/hmip-ws-event-device-changed');
const { HMIPWSGroupChangedEvent } = require('../../../../../src/homematic/ws/model/event/hmip-ws-event-group-changed');
const { HMIPWSHomeChangedEvent } = require('../../../../../src/homematic/ws/model/event/hmip-ws-event-home-changed');

describe('createEventFromJson (event factory dispatch)', () => {
  it('dispatches pushEventType=DEVICE_CHANGED to HMIPWSDeviceChangedEvent', () => {
    const json = {
      pushEventType: 'DEVICE_CHANGED',
      device: { id: 'device-1', type: 'SOME_UNKNOWN_TYPE', functionalChannels: {} },
    };
    expect(createEventFromJson(json)).toBeInstanceOf(HMIPWSDeviceChangedEvent);
  });

  it('dispatches pushEventType=GROUP_CHANGED to HMIPWSGroupChangedEvent', () => {
    const json = {
      pushEventType: 'GROUP_CHANGED',
      group: { id: 'group-1', type: 'META', channels: [] },
    };
    expect(createEventFromJson(json)).toBeInstanceOf(HMIPWSGroupChangedEvent);
  });

  it('dispatches pushEventType=HOME_CHANGED to HMIPWSHomeChangedEvent', () => {
    const json = { pushEventType: 'HOME_CHANGED', home: {} };
    expect(createEventFromJson(json)).toBeInstanceOf(HMIPWSHomeChangedEvent);
  });

  it('returns undefined for an unknown pushEventType instead of throwing', () => {
    expect(createEventFromJson({ pushEventType: 'SOME_NEW_EVENT_TYPE' })).toBeUndefined();
  });

  it.each([undefined, null, 'not-an-object'])('throws for invalid json: %p', (invalid) => {
    expect(() => createEventFromJson(invalid)).toThrow('createEventFromJson: invalid event json');
  });
});
