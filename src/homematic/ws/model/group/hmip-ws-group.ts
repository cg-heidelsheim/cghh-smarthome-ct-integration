import type {HMIPWSGroupChannelRef} from './hmip-ws-group-channel-ref';

export interface HMIPWSGroupParams {
    id: string;
    homeId: string;
    metaGroupId?: unknown;
    label: string;
    lastStatusUpdate: number;
    type: string;
    unreach?: unknown;
    lowBat?: unknown;
    dutyCycle?: unknown;
    channels: HMIPWSGroupChannelRef[];
    sabotage?: unknown;
}

/**
 * Base class for groups
 */
export class HMIPWSGroup {
    id: string;
    homeId: string;
    metaGroupId?: unknown;
    label: string;
    lastStatusUpdate: number;
    type: string;
    unreach?: unknown;
    lowBat?: unknown;
    dutyCycle?: unknown;
    channels: HMIPWSGroupChannelRef[];
    sabotage?: unknown;

    constructor(params: HMIPWSGroupParams) {
        this.id = params.id;
        this.homeId = params.homeId;
        this.metaGroupId = params.metaGroupId;
        this.label = params.label;
        this.lastStatusUpdate = params.lastStatusUpdate;
        this.type = params.type;
        this.unreach = params.unreach;
        this.lowBat = params.lowBat;
        this.dutyCycle = params.dutyCycle;
        this.channels = params.channels;
        this.sabotage = params.sabotage;
    }
}
