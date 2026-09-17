import {HMIPWSGroup} from './hmip-ws-group';
import type {HMIPWSGroupChannelRef} from './hmip-ws-group-channel-ref';

interface HMIPWSMetaGroupParams {
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
    groups?: unknown;
    configPending?: unknown;
    incorrectPositioned?: unknown;
    groupIcon?: unknown;
}

/**
 * META group
 */
export class HMIPWSMetaGroup extends HMIPWSGroup {
    groups?: unknown;
    configPending?: unknown;
    incorrectPositioned?: unknown;
    groupIcon?: unknown;

    constructor(params: HMIPWSMetaGroupParams) {
        super({
            id: params.id,
            homeId: params.homeId,
            metaGroupId: params.metaGroupId,
            label: params.label,
            lastStatusUpdate: params.lastStatusUpdate,
            type: 'META',
            unreach: params.unreach,
            lowBat: params.lowBat,
            dutyCycle: params.dutyCycle,
            channels: params.channels,
            sabotage: params.sabotage
        });


        this.groups = params.groups;
        this.configPending = params.configPending;
        this.incorrectPositioned = params.incorrectPositioned;
        this.groupIcon = params.groupIcon;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSMetaGroup {
        return new HMIPWSMetaGroup({
            id: json.id,
            homeId: json.homeId,
            metaGroupId: json.metaGroupId,
            label: json.label,
            lastStatusUpdate: json.lastStatusUpdate,
            unreach: json.unreach,
            lowBat: json.lowBat,
            dutyCycle: json.dutyCycle,
            channels: json.channels,
            groups: json.groups,
            configPending: json.configPending,
            sabotage: json.sabotage,
            incorrectPositioned: json.incorrectPositioned,
            groupIcon: json.groupIcon
        });
    }
}
