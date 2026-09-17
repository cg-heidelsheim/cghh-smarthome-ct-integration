const { createGroupFromJson } = require('../../../../../src/homematic/ws/model/group/hmip-ws-group-factory');
const { HMIPWSHeatingGroup } = require('../../../../../src/homematic/ws/model/group/hmip-ws-group-heating');
const { HMIPWSMetaGroup } = require('../../../../../src/homematic/ws/model/group/hmip-ws-group-meta');
const { HMIPWSIndoorClimateGroup } = require('../../../../../src/homematic/ws/model/group/hmip-ws-group-indoor-climate');

describe('createGroupFromJson (group factory dispatch)', () => {
  it('dispatches type=HEATING to HMIPWSHeatingGroup and converts channels to HMIPWSGroupChannelRef', () => {
    const json = {
      id: 'group-1',
      type: 'HEATING',
      channels: [{ deviceId: 'device-1', channelIndex: 0 }],
    };
    const result = createGroupFromJson(json);
    expect(result).toBeInstanceOf(HMIPWSHeatingGroup);
    expect(result.channels[0]).toMatchObject({ deviceId: 'device-1', channelIndex: 0 });
  });

  it('dispatches type=META to HMIPWSMetaGroup', () => {
    expect(createGroupFromJson({ id: 'group-2', type: 'META', channels: [] })).toBeInstanceOf(HMIPWSMetaGroup);
  });

  it('dispatches type=INDOOR_CLIMATE to HMIPWSIndoorClimateGroup', () => {
    expect(createGroupFromJson({ id: 'group-3', type: 'INDOOR_CLIMATE', channels: [] })).toBeInstanceOf(HMIPWSIndoorClimateGroup);
  });

  it('returns undefined for an unknown group type instead of throwing', () => {
    expect(createGroupFromJson({ id: 'group-4', type: 'SOME_NEW_GROUP_TYPE', channels: [] })).toBeUndefined();
  });

  it('throws when json is missing', () => {
    expect(() => createGroupFromJson(undefined)).toThrow('createGroupFromJson: group json missing');
  });

  it('treats a group with no channels as an empty list rather than throwing', () => {
    expect(() => createGroupFromJson({ id: 'group-5', type: 'SOME_NEW_GROUP_TYPE' })).not.toThrow();
  });
});
