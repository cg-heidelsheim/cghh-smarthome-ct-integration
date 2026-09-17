import {HMIPWSGroup} from './hmip-ws-group';
import type {HMIPWSGroupChannelRef} from './hmip-ws-group-channel-ref';

interface HMIPWSIndoorClimateGroupParams {
    id: string;
    homeId: string;
    metaGroupId?: unknown;
    label: string;
    lastStatusUpdate: number;
    unreach?: unknown;
    lowBat?: unknown;
    dutyCycle?: unknown;
    channels: HMIPWSGroupChannelRef[];
    sabotage?: unknown;
    processing?: unknown;
    ventilationState?: unknown;
    ventilationLevel?: unknown;
    windowState?: unknown;
}

/**
 * INDOOR_CLIMATE group
 */
export class HMIPWSIndoorClimateGroup extends HMIPWSGroup {
    processing?: unknown;
    ventilationState?: unknown;
    ventilationLevel?: unknown;
    windowState?: unknown;

    constructor(params: HMIPWSIndoorClimateGroupParams) {
        super({
            id: params.id,
            homeId: params.homeId,
            metaGroupId: params.metaGroupId,
            label: params.label,
            lastStatusUpdate: params.lastStatusUpdate,
            type: 'INDOOR_CLIMATE',
            unreach: params.unreach,
            lowBat: params.lowBat,
            dutyCycle: params.dutyCycle,
            channels: params.channels,
            sabotage: params.sabotage
        });

        this.processing = params.processing;
        this.ventilationState = params.ventilationState;
        this.ventilationLevel = params.ventilationLevel;
        this.windowState = params.windowState;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSIndoorClimateGroup {
        return new HMIPWSIndoorClimateGroup({
            id: json.id,
            homeId: json.homeId,
            metaGroupId: json.metaGroupId,
            label: json.label,
            lastStatusUpdate: json.lastStatusUpdate,
            unreach: json.unreach,
            lowBat: json.lowBat,
            dutyCycle: json.dutyCycle,
            channels: json.channels,
            processing: json.processing,
            ventilationState: json.ventilationState,
            ventilationLevel: json.ventilationLevel,
            windowState: json.windowState,
            sabotage: json.sabotage
        });
    }
}
