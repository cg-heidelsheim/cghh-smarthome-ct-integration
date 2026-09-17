const moment = require('../../src/util/timezone.bootstrap');

describe('timezone.bootstrap', () => {
  it('sets the process-wide moment default timezone to Europe/Berlin', () => {
    expect(moment.tz.guess).toBeDefined(); // sanity: it's really moment-timezone
    expect(moment().tz()).toBe('Europe/Berlin');
  });

  it('re-requiring it elsewhere returns the same configured moment instance (module cache)', () => {
    const momentAgain = require('../../src/util/timezone.bootstrap');
    expect(momentAgain).toBe(moment);
  });
});
