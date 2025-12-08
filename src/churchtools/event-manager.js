const ChurchToolsApiClient = require("./ct-api");
const {Logger} = require("../util/logger");
const {HeatingScheduler} = require("../churchtools/heating-scheduler");
const {filterCurrentAndUpcomingEvents} = require("../util/event-filter.util");
const {GroupStateBuilder} = require("../homematic/group/group-state.builder");
const {GroupManagerFactory} = require("../homematic/group/group-manager.factory");
const {EventLogger} = require("../util/event.logger");
const {Event} = require("./model/event");
const {Lock} = require("./../db/model/lock");
const {Booking} = require("./model/booking");
const moment = require("moment");


class EventManager {
    tags = {module: "CRON", function: "EVENT"};

    /**
     * @param {LockDB} lockDB
     * @param {RoomConfigDB} roomConfigDB
     * @param {GroupStateDB} groupStateDB
     */
    constructor(lockDB, roomConfigDB, groupStateDB) {
        this.lockDB = lockDB;
        this.roomConfigDB = roomConfigDB;
        this.groupStateDB = groupStateDB;
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


        const tags = {...this.tags};
        Logger.info({tags, message: "Start event handling - #ofEvents: " + events.length});

        const filteredEvents = filterCurrentAndUpcomingEvents(events);

        Logger.info({tags, message: "Active/Upcoming Events - #ofEvents: " + filteredEvents.length});

        for (const event of filteredEvents) {
            await this.handleEvent(event);
        }

        Logger.info({tags, message: "Finished event handling"});
    };


    /**
     * @param {Event} event     Event to manage
     *
     * @returns void
     */
    async handleEvent(event) {
        this.tags = {...this.tags, event: event.name};
        delete this.tags.group;

        Logger.info({tags: this.tags, message: `Event '${event.name}'`});

        const bookings = event.bookings;

        Logger.info({tags: this.tags, message: `Event '${event.name}' - Bookings: #${bookings.length}`});

        if (bookings.length === 0) {
            return;
        }

        for (const booking of bookings) {
            await this.handleBookingOfEventHeating(event, booking);
        }
    };

    /**
     * Determine if heating needs to be started for passed booking
     *
     * @param {Event} event     Event containing passed booking
     * @param {Booking} booking   Booking (room) to possibly adjust
     *
     * @returns void
     */
    async handleBookingOfEventHeating(event, booking) {
        /** @type {RoomConfig} */
        let roomConfig;

        const ignored = {
            "4": "Küche"
        }

        if (ignored[booking.resourceId]) {
            Logger.info({
                tags: this.tags,
                message: `Event ${event.name} - Booking ${booking.resourceId} aka. '${ignored[booking.resourceId]} - IGNORE'`
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

        if (!this.#isAcceptedBooking(booking)) return;
        if (this.#isEventLocked(roomConfig)) return;

        let groupState = this.#getGroupState(roomConfig);

        await this.#executeHeatingSchedule(roomConfig, event, groupState, booking);
    };

    async #executeHeatingSchedule(roomConfig, event, groupState, booking) {
        const {
            shouldStartHeating, minutesUntilHeatingStart, minutesToReachTemp, minPreOfBooking
        } = HeatingScheduler.calculateHeatingSchedule(roomConfig, event, groupState, booking);

        if (!shouldStartHeating) {
            const message = `Event '${event.name}' - Booking '${roomConfig.name}' - ΔT=${minutesToReachTemp}m | ⏱=${minutesUntilHeatingStart}m`;
            Logger.info({tags: this.tags, message});

            return;
        }

        try {
            const groupManager = GroupManagerFactory.createGroupManager(groupState.id);
            await groupManager.heatForEvent(event);

            EventLogger.groupUpdatePreheat(groupState.label, roomConfig.getDesiredRoomTemperatureForEvent(event), event);
            EventLogger.heatingTimeExpectancy(minutesToReachTemp, minPreOfBooking, groupState);

            const lock = new Lock();
            lock.expiring = moment(event.endDate);
            lock.eventName = event.name;
            lock.id = groupState.id;
            this.lockDB.save(lock);
        } catch (e) {
            if (e.message !== "Blocked") {
                Logger.error({tags: this.tags, message: `Error on executeHeatingSchedule ${e.message}`})
            } else {
                // blocked due to existing manual override
                EventLogger.groupUpdatePreheatBlocked(event.name, groupState.label);
            }
        }
    }

    #getGroupState(roomConfig) {
        try {
            return this.groupStateDB.getById(roomConfig.homematicId);
        } catch (e) {
            Logger.error({message: "Group state not found in DB. Using Dummy. Error: " + e.message});
            return GroupStateBuilder.dummyState(roomConfig.homematicId);
        }
    }

    /**
     *
     * @param {Booking} booking
     * @returns {boolean}
     */
    #isAcceptedBooking(booking) {
        // ONLY ALLOW ROOMS WITH STATUS "gebucht"
        if (booking.statusId !== "2") {
            Logger.warn({tags: this.tags, message: `Booking ${booking.id} not in status "accepted"`});
            return false;
        }

        return true;
    }

    #isEventLocked(roomConfig) {
        try {
            this.lockDB.getById(roomConfig.homematicId);
            Logger.info({tags: this.tags, message: `${roomConfig.name} is locked - SKIP`});
            return true;
        } catch (err) {
            Logger.debug({tags: this.tags, message: `${roomConfig.name} is not locked`});
            return false;
        }
    }
}

module.exports = {EventManager}
