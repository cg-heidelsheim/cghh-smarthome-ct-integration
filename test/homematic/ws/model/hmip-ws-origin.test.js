const {HMIPWSOrigin} = require('../../../../src/homematic/ws/model/hmip-ws-origin');

describe('HMIPWSOrigin.fromJson', () => {
  it('maps originType and id', () => {
    const origin = HMIPWSOrigin.fromJson({originType: 'DEVICE', id: 'client-123'});

    expect(origin.originType).toBe('DEVICE');
    expect(origin.id).toBe('client-123');
  });

  it('throws when json is missing', () => {
    expect(() => HMIPWSOrigin.fromJson(undefined)).toThrow('HMIPWSOrigin.fromJson: origin is missing');
    expect(() => HMIPWSOrigin.fromJson(null)).toThrow('HMIPWSOrigin.fromJson: origin is missing');
  });
});
