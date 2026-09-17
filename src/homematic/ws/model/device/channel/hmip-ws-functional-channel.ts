export class HMIPWSFunctionalChannel {
    functionalChannelType: string;
    deviceId: string;
    index: number;
    groupIndex: number;
    label: string;
    groups: string[];
    supportedOptionalFeatures: Record<string, unknown>;

    constructor(
        functionalChannelType: string,
        deviceId: string,
        index: number,
        groupIndex: number,
        label: string,
        groups: string[],
        supportedOptionalFeatures: Record<string, unknown>
    ) {
        this.functionalChannelType = functionalChannelType;
        this.deviceId = deviceId;
        this.index = index;
        this.groupIndex = groupIndex;
        this.label = label;
        this.groups = groups;
        this.supportedOptionalFeatures = supportedOptionalFeatures;
    }
}
