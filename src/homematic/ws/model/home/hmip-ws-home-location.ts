export class HMIPWSHomeLocation {
    city: string;
    latitude?: number;
    longitude?: number;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    constructor(json: Record<string, any>) {
        this.city = json.city;
        this.latitude = json.latitude;
        this.longitude = json.longitude;
    }
}
