import {shallowEqualsOn} from './shallow-equals.util';

/**
 * Represents the state of a group with values relevant for comparison.
 */
export class GroupState {
    /** Unique identifier for the group. */
    id!: string;

    /** Human-readable name for the group. */
    label!: string;

    /** Current temperature value. */
    temperature!: number;

    /** Target set temperature value. */
    setTemperature!: number;

    /** Current humidity level. */
    humidity!: number;

    /**
     * Carried forward from the previous state by the WS event listener; nothing in this
     * codebase currently writes a real value here (see homematic-event-listener.js), so
     * in practice it's always undefined - kept as-is rather than removed, to not change
     * observed behavior as part of this migration.
     */
    lock?: unknown;

    /**
     * Compares the value attributes (temperature, setTemperature, humidity) of this GroupState
     * with another GroupState instance. Does not compare id or label which are identifiers.
     *
     * @param other Another GroupState instance to compare against.
     * @returns True if the compared attributes are equal, false otherwise.
     */
    equalsValueAttributes(other: GroupState): boolean {
        return shallowEqualsOn(this, other, ['temperature', 'setTemperature', 'humidity']);
    }
}
