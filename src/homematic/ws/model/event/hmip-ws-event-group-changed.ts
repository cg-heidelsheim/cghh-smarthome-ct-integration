import {HMIPWSEvent} from './hmip-ws-event';
import {createGroupFromJson} from '../group/hmip-ws-group-factory';
import type {HMIPWSGroup} from '../group/hmip-ws-group';

/**
 * GROUP_CHANGED event
 */
export class HMIPWSGroupChangedEvent extends HMIPWSEvent {
    group: HMIPWSGroup | undefined;

    constructor(group: HMIPWSGroup | undefined) {
        super('GROUP_CHANGED');
        this.group = group;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSGroupChangedEvent {
        const group = createGroupFromJson(json.group);
        return new HMIPWSGroupChangedEvent(group);
    }
}
