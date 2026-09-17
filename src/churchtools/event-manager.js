const ChurchToolsApiClient = require('./ct-api');
const {Logger} = require('../util/logger');
const {HeatingScheduler} = require('../churchtools/heating-scheduler');
const {filterCurrentAndUpcomingEvents} = require('../util/event-filter.util');
const {GroupStateBuilder} = require('../homematic/group/group-state.builder');
const {GroupManagerFactory} = require('../homematic/group/group-manager.factory');
const {EventLogger} = require('../util/event.logger');
const {Lock} = require('./../db/model/lock');
const moment = require('moment');


class EventManager {
    tags = {module: 'CRON', function: 'EVENT'};

    /**
     * @param {import('../db/lock.db').LockDB} lockDB
     * @param {import('../db/room-config.db').RoomConfigDB} roomConfigDB
     * @param {import('../db/group-state.db').GroupStateDB} groupStateDB
     * @param {import('../db/event-room-configuration.db').EventRoomConfigDB} eventRoomConfigDB
     */
    constructor(lockDB, roomConfigDB, groupStateDB, eventRoomConfigDB) {
        this.lockDB = lockDB;
        this.roomConfigDB = roomConfigDB;
        this.groupStateDB = groupStateDB;
        this.eventRoomConfigDB = eventRoomConfigDB;
    }

    /**
     * Filter relevant HEATING events and execute event handling.
     * Relevant events are events that did not start yet.
     *
     * @returns void
     */
    async handleEvents() {
        const ctClient = new ChurchToolsApiClient();
        const events = await ctClient.getEvents();

        // Fetched once per run and threaded through, rather than each booking re-reading
        // the event-room-config file from disk individually.
        const eventRoomConfigs = this.eventRoomConfigDB.getAll();

        const tags = {...this.tags};
        Logger.info({tags, message: 'Start event handling - #ofEvents: ' + events.length});

        const filteredEvents = filterCurrentAndUpcomingEvents(events);

        Logger.info({tags, message: 'Active/Upcoming Events - #ofEvents: ' + filteredEvents.length});

        for (const event of filteredEvents) {
            await this.handleEvent(event, eventRoomConfigs);
        }

        Logger.info({tags, message: 'Finished event handling'});
    };


    /**
     * @param {import('./model/event').Event} event     Event to manage
     * @param {import('../db/model/event-room-config.model').EventRoomConfig[]} eventRoomConfigs
     *
     * @returns void
     */
    async handleEvent(event, eventRoomConfigs) {
        this.tags = {...this.tags, event: event.name};
        delete this.tags.group;

        Logger.info({tags: this.tags, message: `--- Event '${event.name}' ---`});

        const bookings = event.bookings;

        Logger.info({tags: this.tags, message: `Event '${event.name}' - Bookings: #${bookings.length}`});

        if (bookings.length === 0) {
            return;
        }

        for (const booking of bookings) {
            await this.handleBookingOfEventHeating(event, booking, eventRoomConfigs);
        }
    };

    /**
     * Determine if heating needs to be started for passed booking
     *
     * @param {import('./model/event').Event} event     Event containing passed booking
     * @param {import('./model/booking').Booking} booking   Booking (room) to possibly adjust
     * @param {import('../db/model/event-room-config.model').EventRoomConfig[]} eventRoomConfigs
     *
     * @returns void
     */
    async handleBookingOfEventHeating(event, booking, eventRoomConfigs) {
        /** @type {RoomConfig} */
        let roomConfig;

        const ignored = {
            '4': 'Küche'
        };

        if (ignored[booking.resourceId]) {
            Logger.info({
                tags: this.tags,
                message: `Event '${event.name}' - Booking ${booking.resourceId} aka. '${ignored[booking.resourceId]}' - IGNORE`
            });
            return;
        }

        try {
            roomConfig = this.roomConfigDB.findByCTId(booking.resourceId);
        } catch (e) {
            Logger.error({tags: this.tags, message: `Error on handleBookingOfEventHeating: ${e.message}`});
            return;
        }

        this.tags = {...this.tags, group: roomConfig.name.replace(/ /g, '_')};

        if (!this.#isAcceptedBooking(booking)) {return;}
        if (this.#isRoomLocked(roomConfig)) {return;}

        const groupState = this.#getGroupState(roomConfig);

        await this.#executeHeatingSchedule(roomConfig, event, groupState, booking, eventRoomConfigs);
    };

    async #executeHeatingSchedule(roomConfig, event, groupState, booking, eventRoomConfigs) {
        const {
            shouldStartHeating, minutesUntilHeatingStart, minutesToReachTemp, minutesPreOfBooking
        } = HeatingScheduler.calculateHeatingSchedule(roomConfig, event, groupState, booking, eventRoomConfigs);

        if (!shouldStartHeating) {
            const message = `Event '${event.name}' - Booking '${roomConfig.name}' - ΔT=${minutesToReachTemp}m | ⏱=${minutesUntilHeatingStart}m`;
            Logger.info({tags: this.tags, message});

            return;
        }

        try {
            const groupManager = GroupManagerFactory.createGroupManager(groupState.id);
            await groupManager.heatForEvent(event, eventRoomConfigs);

            EventLogger.groupUpdatePreheat(groupState.label, roomConfig.getDesiredRoomTemperatureForEvent(event, eventRoomConfigs), event);
            EventLogger.heatingTimeExpectancy(minutesToReachTemp, minutesPreOfBooking, groupState);

            const message = `Event '${event.name}' - Booking '${roomConfig.name}' Start heating`;
            Logger.info({tags: this.tags, message});

            const lock = new Lock();
            lock.expiring = moment(event.endDate);
            lock.eventName = event.name;
            lock.id = groupState.id;
            this.lockDB.save(lock);
        } catch (e) {
            if (e.message !== 'Blocked') {
                Logger.error({tags: this.tags, message: `Error on executeHeatingSchedule ${e.message}`});
            } else {
                // blocked due to existing manual override
                EventLogger.groupUpdatePreheatBlocked(event.name, groupState.label);
            }
        }
    }

    #getGroupState(roomConfig) {
        const groupState = this.groupStateDB.tryGetById(roomConfig.homematicId);
        if (!groupState) {
            Logger.error({message: 'Group state not found in DB. Using Dummy.'});
            return GroupStateBuilder.dummyState(roomConfig.homematicId);
        }
        return groupState;
    }

    /**
     *
     * @param {import('./model/booking').Booking} booking
     * @returns {boolean}
     */
    #isAcceptedBooking(booking) {
        // ONLY ALLOW ROOMS WITH STATUS "gebucht"
        if (booking.statusId !== '2') {
            Logger.warn({tags: this.tags, message: `Booking ${booking.id} not in status "accepted"`});
            return false;
        }

        return true;
    }

    #isRoomLocked(roomConfig) {
        if (this.lockDB.tryGetById(roomConfig.homematicId)) {
            Logger.info({tags: this.tags, message: `Room '${roomConfig.name}' is locked`});
            return true;
        }
        Logger.debug({tags: this.tags, message: `Room '${roomConfig.name}' is not locked`});
        return false;
    }
}

module.exports = {EventManager};
