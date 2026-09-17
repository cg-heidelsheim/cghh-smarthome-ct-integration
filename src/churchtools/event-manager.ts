import ChurchToolsApiClient from './ct-api';
import {Logger} from '../util/logger';
import {HeatingScheduler} from '../churchtools/heating-scheduler';
import {filterCurrentAndUpcomingEvents} from '../util/event-filter.util';
import {GroupStateBuilder} from '../homematic/group/group-state.builder';
import {GroupManagerFactory} from '../homematic/group/group-manager.factory';
import {EventLogger} from '../util/event.logger';
import {Lock} from './../db/model/lock';
import moment from 'moment';
import type {LockDB} from '../db/lock.db';
import type {RoomConfigDB} from '../db/room-config.db';
import type {GroupStateDB} from '../db/group-state.db';
import type {EventRoomConfigDB} from '../db/event-room-configuration.db';
import type {Event} from './model/event';
import Booking = require('./model/booking');
import type {EventRoomConfig} from '../db/model/event-room-config.model';
import type {RoomConfig} from '../db/model/room-config';
import type {GroupState} from '../db/model/group-state';

export class EventManager {
    tags: Record<string, unknown> = {module: 'CRON', function: 'EVENT'};
    lockDB: LockDB;
    roomConfigDB: RoomConfigDB;
    groupStateDB: GroupStateDB;
    eventRoomConfigDB: EventRoomConfigDB;

    constructor(lockDB: LockDB, roomConfigDB: RoomConfigDB, groupStateDB: GroupStateDB, eventRoomConfigDB: EventRoomConfigDB) {
        this.lockDB = lockDB;
        this.roomConfigDB = roomConfigDB;
        this.groupStateDB = groupStateDB;
        this.eventRoomConfigDB = eventRoomConfigDB;
    }

    /**
     * Filter relevant HEATING events and execute event handling.
     * Relevant events are events that did not start yet.
     */
    async handleEvents(): Promise<void> {
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
    }

    /**
     * @param event     Event to manage
     */
    async handleEvent(event: Event, eventRoomConfigs: EventRoomConfig[]): Promise<void> {
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
    }

    /**
     * Determine if heating needs to be started for passed booking
     *
     * @param event     Event containing passed booking
     * @param booking   Booking (room) to possibly adjust
     */
    async handleBookingOfEventHeating(event: Event, booking: Booking, eventRoomConfigs: EventRoomConfig[]): Promise<void> {
        let roomConfig: RoomConfig;

        const ignored: Record<string, string> = {
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
    }

    async #executeHeatingSchedule(roomConfig: RoomConfig, event: Event, groupState: GroupState, booking: Booking, eventRoomConfigs: EventRoomConfig[]) {
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
            // .toISOString() rather than assigning the Moment object directly: Lock.expiring
            // is a persisted string field (see db/model/lock.ts). The original JS assigned
            // the Moment instance itself, type-incorrect but functionally harmless since it
            // was never read again before lockDB.save() serializes it via JSON.stringify,
            // which calls the Moment's own toJSON() - defined as `.toISOString()` - anyway.
            lock.expiring = moment(event.endDate).toISOString();
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

    #getGroupState(roomConfig: RoomConfig): GroupState {
        const groupState = this.groupStateDB.tryGetById(roomConfig.homematicId);
        if (!groupState) {
            Logger.error({message: 'Group state not found in DB. Using Dummy.'});
            return GroupStateBuilder.dummyState(roomConfig.homematicId);
        }
        return groupState;
    }

    #isAcceptedBooking(booking: Booking): boolean {
        // ONLY ALLOW ROOMS WITH STATUS "gebucht"
        if (booking.statusId !== '2') {
            Logger.warn({tags: this.tags, message: `Booking ${booking.id} not in status "accepted"`});
            return false;
        }

        return true;
    }

    #isRoomLocked(roomConfig: RoomConfig): boolean {
        if (this.lockDB.tryGetById(roomConfig.homematicId)) {
            Logger.info({tags: this.tags, message: `Room '${roomConfig.name}' is locked`});
            return true;
        }
        Logger.debug({tags: this.tags, message: `Room '${roomConfig.name}' is not locked`});
        return false;
    }
}
