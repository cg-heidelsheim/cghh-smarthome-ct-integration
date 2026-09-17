/**
 * Top-level WebSocket message for Homematic IP
 * This models the full JSON you posted.
 */

import {HMIPWSOrigin} from './hmip-ws-origin';
import {createEventFromJson} from './event/hmip-ws-event-factory';
import type {HMIPWSEvent} from './event/hmip-ws-event';

export class HMIPWSMessage {
    events: (HMIPWSEvent | undefined)[];
    origin: HMIPWSOrigin;
    accessPointId: string;
    timestamp: number;

    constructor(events: (HMIPWSEvent | undefined)[], origin: HMIPWSOrigin, accessPointId: string, timestamp: number) {
        this.events = events;
        this.origin = origin;
        this.accessPointId = accessPointId;
        this.timestamp = timestamp;
    }

    /**
     * Convert raw WS JSON into typed message.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSMessage {
        if (!json || typeof json !== 'object') {
            throw new Error('HMIPWSMessage.fromJson: invalid json');
        }

        const eventsObject = json.events || {};
        const events = Object.values(eventsObject).map((evJson) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
            createEventFromJson(evJson as Record<string, any>)
        );

        const origin = HMIPWSOrigin.fromJson(json.origin);

        return new HMIPWSMessage(
            events,
            origin,
            json.accessPointId,
            json.timestamp
        );
    }
}
