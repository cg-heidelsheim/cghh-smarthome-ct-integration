const moment = require('../../../src/util/timezone.bootstrap');
const {Event} = require('../../../src/churchtools/model/event');
const {filterCurrentAndUpcomingEvents} = require('../../../src/util/event-filter.util');

const raw = (startdate, enddate) => ({
    startdate, enddate, bezeichnung: 'EC Party', category_id: '1', category_name: 'Cat',
});

describe('Event.fromJSON', () => {
    it('keeps the dates of a regular timed event untouched', () => {
        const event = Event.fromJSON(raw('2026-11-14 10:00:00', '2026-11-14 12:00:00'));

        expect(event.startDate).toBe('2026-11-14 10:00:00');
        expect(event.endDate).toBe('2026-11-14 12:00:00');
        expect(event.allDay).toBe(false);
    });

    it('maps a single-day all-day event (start === end, both midnight) to 06:00-22:00 of that day', () => {
        // Exactly what ChurchTools sent for "EC Party" on 2026-11-14.
        const event = Event.fromJSON(raw('2026-11-14 00:00:00', '2026-11-14 00:00:00'));

        expect(event.startDate).toBe('2026-11-14 06:00:00');
        expect(event.endDate).toBe('2026-11-14 22:00:00');
        expect(event.allDay).toBe(true);
    });

    it('maps a multi-day all-day event to 06:00 on the first day and 22:00 on the last day', () => {
        const event = Event.fromJSON(raw('2026-11-14 00:00:00', '2026-11-15 00:00:00'));

        expect(event.startDate).toBe('2026-11-14 06:00:00');
        expect(event.endDate).toBe('2026-11-15 22:00:00');
        expect(event.allDay).toBe(true);
    });

    it('does not treat an event as all-day when only one end is at midnight', () => {
        const event = Event.fromJSON(raw('2026-11-13 20:00:00', '2026-11-14 00:00:00'));

        expect(event.startDate).toBe('2026-11-13 20:00:00');
        expect(event.endDate).toBe('2026-11-14 00:00:00');
        expect(event.allDay).toBe(false);
    });

    it('tolerates missing dates', () => {
        const event = Event.fromJSON({bezeichnung: 'X'});

        expect(event.startDate).toBeUndefined();
        expect(event.allDay).toBe(false);
    });
});

describe('all-day events through the cron filter (regression: 2026-11-14)', () => {
    const berlin = (s) => moment.tz(s, 'Europe/Berlin').toDate();
    const allDay = () => Event.fromJSON(raw('2026-11-14 00:00:00', '2026-11-14 00:00:00'));

    afterEach(() => jest.useRealTimers());

    it.each([
        ['the evening before (still upcoming)', '2026-11-13 23:00:00'],
        ['during the day (in progress)', '2026-11-14 12:00:00'],
    ])('is still considered %s', (_label, now) => {
        jest.useFakeTimers().setSystemTime(berlin(now));
        expect(filterCurrentAndUpcomingEvents([allDay()])).toHaveLength(1);
    });

    it('is dropped once the day\'s heating window has ended', () => {
        jest.useFakeTimers().setSystemTime(berlin('2026-11-14 22:30:00'));
        expect(filterCurrentAndUpcomingEvents([allDay()])).toHaveLength(0);
    });

    it('expires its lock at 22:00 on the day, not at midnight before it', () => {
        expect(moment(allDay().endDate).toISOString()).toBe(berlin('2026-11-14 22:00:00').toISOString());
    });
});
