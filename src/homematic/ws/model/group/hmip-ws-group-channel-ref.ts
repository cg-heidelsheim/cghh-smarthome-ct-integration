/**
 * Small helper for group channel references
 */
export class HMIPWSGroupChannelRef {
    deviceId: string;
    channelIndex: number;

    constructor(deviceId: string, channelIndex: number) {
        this.deviceId = deviceId;
        this.channelIndex = channelIndex;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSGroupChannelRef {
        return new HMIPWSGroupChannelRef(json.deviceId, json.channelIndex);
    }
}
