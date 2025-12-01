const { ChannelState } = require('../../src/homematic/device/channel-state');

describe('ChannelState.equalsValueAttributes', () => {
  let channelA;
  let channelB;

  beforeEach(() => {
    channelA = new ChannelState();
    channelB = new ChannelState();

    channelA.index = 1;
    channelA.valvePosition = 0;
    channelA.temperature = 18.6;
    channelA.setTemperature = 16;

    channelB.index = 1;
    channelB.valvePosition = 0;
    channelB.temperature = 18.6;
    channelB.setTemperature = 16;
  });

  test('returns true if all compared value attributes are identical', () => {
    expect(channelA.equalsValueAttributes(channelB)).toBe(true);
  });

  test('returns true if index differs', () => {
    channelB.index = 2;
    expect(channelA.equalsValueAttributes(channelB)).toBe(true);
  });

  test('returns false if valvePosition differs', () => {
    channelB.valvePosition = 1;
    expect(channelA.equalsValueAttributes(channelB)).toBe(false);
  });

  test('returns false if temperature differs', () => {
    channelB.temperature = 19.0;
    expect(channelA.equalsValueAttributes(channelB)).toBe(false);
  });

  test('returns false if setTemperature differs', () => {
    channelB.setTemperature = 17;
    expect(channelA.equalsValueAttributes(channelB)).toBe(false);
  });

  test('returns false if other is null or undefined', () => {
    expect(channelA.equalsValueAttributes(null)).toBe(false);
    expect(channelA.equalsValueAttributes(undefined)).toBe(false);
  });
});
