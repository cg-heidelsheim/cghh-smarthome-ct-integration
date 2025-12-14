class HMIPWSHomeLocation {
    constructor(json) {
        this.city = json.city;
        this.latitude = json.latitude;
        this.longitude = json.longitude;
    }
}

module.exports = {HMIPWSHomeLocation}
