export class EventRoomConfig {
    /** Identifier of the event (name) */
    id!: string;

    /** Desired temperature for that exact event */
    desiredTemperature!: number;

    /** Comment explaining the decision */
    comment!: string;
}
