import {shallowEqualsOn} from './shallow-equals.util';

/**
 * Represents the state of a channel in a {@link Device}.
 *
 * Fields are populated externally (via Object.assign or a builder), never in a
 * constructor - the `!` (definite assignment assertion) reflects that honestly rather
 * than making every field optional and forcing null-checks at every use site.
 */
export class ChannelState {
    /** Index of the channel. */
    index!: number;

    /** Position of the valve. */
    valvePosition!: number;

    /** Current temperature in the channel. */
    temperature!: number;

    /** Set temperature for the channel. */
    setTemperature!: number;

    /**
     * Compares this channel state with another channel state.
     * @returns true if all compared attributes are equal, false otherwise
     */
    equalsValueAttributes(other: ChannelState): boolean {
        return shallowEqualsOn(this, other, ['temperature', 'setTemperature', 'valvePosition']);
    }
}
