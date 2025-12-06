class HMIPWSOrigin {
    /**
     * @param {HMIPWSOriginType} originType
     * @param {string} id
     */
    constructor(originType, id) {
        this.originType = originType;
        this.id = id;
    }

    /**
     * @param {any} json
     * @returns {HMIPWSOrigin}
     */
    static fromJson(json) {
        if (!json) {
            throw new Error('HMIPWSOrigin.fromJson: origin is missing');
        }
        return new HMIPWSOrigin(json.originType, json.id);
    }
}

module.exports = {HMIPWSOrigin}
