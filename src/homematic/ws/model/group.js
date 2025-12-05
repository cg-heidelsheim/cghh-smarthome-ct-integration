/**
 * Represents a heating group in Homematic IP
 *
 * @typedef Object
 * @property {string} id
 * @property {string} label
 * @property {number} actualTemperature
 * @property {number} setPointTemperature
 * @property {number} humidity
 * ... many more
 */
class HMIPWSGroup {
    /**
     * @param {Object} raw
     */
    constructor(raw = {}) {
        // Copy everything (including extra fields you don't care about yet)
        Object.assign(this, raw);
    }

    static from(rawJson) {
        return new HMIPWSGroup(rawJson);
    }
}

export default HMIPWSGroup;