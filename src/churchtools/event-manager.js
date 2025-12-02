const {getEvents} = require("./events");
const {Logger} = require("../util/logger");
const {filterCurrentAndUpcomingEvents} = require("../util/event-filter.util");
const {GroupStateBuilder} = require("../homematic/group/group-state.builder");
const {GroupManagerFactory} = require("../homematic/group/group-manager.factory");
const {EventLogger} = require("../util/event.logger");
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
        const events = await getEvents();

        Logger.info({tags: this.tags, message: "Start event handling. Events: #" + events.length});

        const filteredEvents = filterCurrentAndUpcomingEvents(events);

        Logger.info({tags: this.tags, message: "Active/Upcoming Events: #" + filteredEvents.length});

        for (const event of filteredEvents) {
            await this.handleEvent(event);
        }

        Logger.info({tags: this.tags, message: "Finished event handling"});
    };


    /**
     * @param {*} event     Event to manage
     *
     * @returns void
     */
    async handleEvent(event) {
        const tags = {...this.tags, event: event.bezeichnung};

        Logger.debug({tags, message: `Handling event ${event.bezeichnung}`});

        const bookings = event.bookings;

        if (!bookings) {
            Logger.info({tags, message: `Event has no bookings`});
            return;
        }

        const bookingValues = Object.values(bookings);
        Logger.debug({tags, message: `Bookings: #${bookingValues.length}`});

        for (const booking of bookingValues) {
            await this.handleBookingOfEventHeating(event, booking);
        }
    };

    /**
     * Determine if heating needs to be started for passed booking
     *
     * @param {*} event     Event containing passed booking
     * @param {*} booking   Booking (room) to possibly adjust
     *
     * @returns void
     */
    async handleBookingOfEventHeating(event, booking) {
        /** @type {RoomConfig} */
        let roomConfig;

        try {
            roomConfig = this.roomConfigDB.getByCTId(booking.resource_id);
        } catch (e) {
            Logger.error({tags: this.tags, message: `${e.message}`});
            return;
        }

        const tags = {...this.tags, group: roomConfig.name.replace(/ /g, '_'), event: event.bezeichnung};

        // ONLY ALLOW ROOMS WITH STATUS "gebucht"
        if (booking.status_id !== "2") {
            Logger.warn({tags: tags, message: `Booking for group is not in status "accepted"`});
            return;
        }

        try {
            this.lockDB.getById(roomConfig.homematicId);
            Logger.info({tags, message: `${roomConfig.name} is locked - SKIP`});
            return;
        } catch (err) {
            Logger.debug({tags, message: `${roomConfig.name} is not locked`});
        }

        let groupState;

        try {
            groupState = this.groupStateDB.getById(roomConfig.homematicId);
        } catch (e) {
            Logger.error({message: "Group state not found in DB. Using Dummy. Error: " + e.message});
            groupState = GroupStateBuilder.dummyState(roomConfig.homematicId);
        }

        let minsToReachTemp = roomConfig.getMinutesNeededToReachTemperatureForEvent(event, groupState);
        minsToReachTemp = Math.round(minsToReachTemp);

        const minPreOfBooking = booking.minpre;
        minsToReachTemp += minPreOfBooking;

        const calculatedTimeToStartHeating = moment(event.startdate).subtract(minsToReachTemp, "minute");

        const calculatedTimeIsOverdue = calculatedTimeToStartHeating.isBefore(moment());
        const eventAlreadyStarted = moment(event.startdate).isBefore(moment());

        let now = moment(new Date());
        let duration = moment.duration(calculatedTimeToStartHeating.diff(now));
        let minutes = duration.asMinutes();

        if (calculatedTimeIsOverdue || eventAlreadyStarted) {
            try {
                const groupManager = GroupManagerFactory.createGroupManager(groupState.id);
                await groupManager.heatForEvent(event);

                EventLogger.groupUpdatePreheat(groupState.label, roomConfig.getDesiredRoomTemepratureForEvent(event), event);
                EventLogger.heatingTimeExpectancy(minsToReachTemp, minPreOfBooking);

                const lock = new Lock();
                lock.expiring = moment(event.enddate);
                lock.eventName = event.bezeichnung;
                lock.id = groupState.id;
                this.lockDB.save(lock);
            } catch (e) {
                if (e.message !== "Blocked") Logger.error({tags, message: e.message});

                // blocked due to existing manual override
                EventLogger.groupUpdatePreheatBlocked(event.bezeichnung, groupState.label);
            }
        } else {
            const message = `Event ${event.bezeichnung} lies too far in the future. Min. needed: ${minsToReachTemp} - Preheat in approx. ${minutes} min.`;
            Logger.debug({tags, message});
        }
    };
}

exports.module = {EventManager}