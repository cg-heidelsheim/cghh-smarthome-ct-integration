export type HMIPWSOriginType = 'DEVICE' | 'GROUP' | 'HOME';

export class HMIPWSOrigin {
    originType: HMIPWSOriginType;
    id: string;

    constructor(originType: HMIPWSOriginType, id: string) {
        this.originType = originType;
        this.id = id;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSOrigin {
        if (!json) {
            throw new Error('HMIPWSOrigin.fromJson: origin is missing');
        }
        return new HMIPWSOrigin(json.originType, json.id);
    }
}
