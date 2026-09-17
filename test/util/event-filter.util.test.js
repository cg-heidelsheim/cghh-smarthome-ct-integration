const moment = require('moment-timezone');
const {filterCurrentAndUpcomingEvents} = require('../../src/util/event-filter.util');

describe('filterCurrentAndUpcomingEvents', () => {
    const now = moment();

    const pastEvent = {
        name: 'Past',
        startDate: now.clone().subtract(2, 'hours').toISOString(),
        endDate: now.clone().subtract(1, 'hours').toISOString(),
    };
    const currentEvent = {
        name: 'Current',
        startDate: now.clone().subtract(30, 'minutes').toISOString(),
        endDate: now.clone().add(30, 'minutes').toISOString(),
    };
    const futureEventSoon = {
        name: 'FutureSoon',
        startDate: now.clone().add(1, 'hours').toISOString(),
        endDate: now.clone().add(2, 'hours').toISOString(),
    };
    const futureEventLater = {
        name: 'FutureLater',
        startDate: now.clone().add(3, 'hours').toISOString(),
        endDate: now.clone().add(4, 'hours').toISOString(),
    };

    it('excludes events that have already ended', () => {
        const result = filterCurrentAndUpcomingEvents([pastEvent]);
        expect(result).toHaveLength(0);
    });

    it('includes an event currently in progress', () => {
        const result = filterCurrentAndUpcomingEvents([currentEvent]);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Current');
    });

    it('includes future events', () => {
        const result = filterCurrentAndUpcomingEvents([futureEventSoon]);
        expect(result).toHaveLength(1);
    });

    it('sorts current and upcoming events by startDate ascending', () => {
        const result = filterCurrentAndUpcomingEvents([futureEventLater, currentEvent, futureEventSoon, pastEvent]);
        expect(result.map(e => e.name)).toEqual(['Current', 'FutureSoon', 'FutureLater']);
    });

    it('returns an empty array for no events', () => {
        expect(filterCurrentAndUpcomingEvents([])).toEqual([]);
    });

    it('excludes an event ending exactly now (endpoint is not "between")', () => {
        const endingNowEvent = {
            name: 'EndingNow',
            startDate: now.clone().subtract(1, 'hours').toISOString(),
            endDate: now.clone().toISOString(),
        };
        const result = filterCurrentAndUpcomingEvents([endingNowEvent]);
        expect(result).toHaveLength(0);
    });
});
