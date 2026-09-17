const {shallowEqualsOn} = require('./shallow-equals.util');

/**
 * Represents the state of a group with values relevant for comparison.
 */
class GroupState {
    /**
     * Unique identifier for the group.
     * @type {string}
     */
    id;

    /**
     * Human-readable name for the group.
     * @type {string}
     */
    label;

    /**
     * Current temperature value.
     * @type {number}
     */
    temperature;

    /**
     * Target set temperature value.
     * @type {number}
     */
    setTemperature;

    /**
     * Current humidity level.
     * @type {number}
     */
    humidity;

    /**
     * Compares the value attributes (temperature, setTemperature, humidity) of this GroupState
     * with another GroupState instance. Does not compare id or label which are identifiers.
     *
     * @param {GroupState} other Another GroupState instance to compare against.
     * @returns {boolean} True if the compared attributes are equal, false otherwise.
     */
    equalsValueAttributes(other) {
        return shallowEqualsOn(this, other, ['temperature', 'setTemperature', 'humidity']);
    }
}

module.exports = {GroupState};
