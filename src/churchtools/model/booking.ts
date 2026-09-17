/**
 * Represents a Booking entry related to an Event.
 */
class Booking {
    id: string;
    minPre: number;
    minPost: number;
    resourceId: string;
    statusId: string;
    location: string | null;
    note: string | null;

    constructor(id: string, minPre: number, minPost: number, resourceId: string, statusId: string, location: string | null = null, note: string | null = null) {
        this.id = id;
        this.minPre = minPre;
        this.minPost = minPost;
        this.resourceId = resourceId;
        this.statusId = statusId;
        this.location = location;
        this.note = note;
    }

    /**
     * Convert JSON Object (from e.g. the API) into a proper class
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external API payload, genuinely untyped
    static fromJSON(json: any): Booking {
        return new Booking(
            json.id,
            json.minpre,
            json.minpost,
            json.resource_id,
            json.status_id,
            json.location,
            json.note
        );
    }
}

export = Booking;
