class HMIPWSOrigin {
    /**
     * Type of origin. e.g. "INTERNAL" or "DEVICE"
     * @type {String}
     */
    originType

    /**
     * ID of origin. e.g. "49.1/8.65" for "INTERNAL", or "3014F711A000201D898CDD9B" for a "DEVICE"
     * @type {String}
     */
    id

    constructor(rawOrigin) {
        this.originType = rawOrigin.originType;
        this.id = rawOrigin.id;
    }
}

module.exports = {HMIPWSOrigin}