import type {Event} from '../../churchtools/model/event';
import type {GroupState} from './group-state';
import type {EventRoomConfig} from './event-room-config.model';

export class RoomConfig {

    id!: string; // CT ID
    name!: string;
    homematicName!: string;
    homematicId!: string; // HMIP ID
    desiredTemperature!: number;
    desiredTemperatureIdle!: number;
    heatingRate!: number;
    spinUpTime!: number;

    /**
     * Calculate the approx. minutes to heat the room.
     * Calculated by taking the current temperature and room heating rate into account.
     */
    getMinutesNeededToReachTemperatureForEvent(event: Event, groupState: GroupState, eventRoomConfigs: EventRoomConfig[]): number {
        const desiredTemperature = this.getDesiredRoomTemperatureForEvent(event, eventRoomConfigs);
        const currentRoomTemperature = groupState.temperature;

        if (!currentRoomTemperature) {return 120;} // fallback if no current temperature entry is present

        const spinUpTime = this.spinUpTime;
        const minutesPerDegree = this.heatingRate;
        const degreeDifference = desiredTemperature - currentRoomTemperature;

        if (degreeDifference < 0) {return 0;} // no heating needed

        return spinUpTime + (degreeDifference * minutesPerDegree);
    }

    /**
     * Get the desired temperature for this room in regard to a specific event.
     * Some events require different temperatures than the default desired temperature for the particular room.
     *
     * Pure: takes the already-fetched event-room-config list rather than reading it from
     * disk itself, so this model layer performs no I/O of its own - the caller (typically
     * EventManager, which already owns an EventRoomConfigDB) fetches it once and passes it in.
     *
     * @returns Temperature in °C
     */
    getDesiredRoomTemperatureForEvent(event: Event, eventRoomConfigs: EventRoomConfig[]): number {
        let temperature = this.desiredTemperature;

        // Case-insensitive partial match
        for (const config of eventRoomConfigs) {
            if (event.name.toLowerCase().includes(config.id.toLowerCase())) {
                temperature = config.desiredTemperature;
            }
        }

        return temperature;
    }
}
