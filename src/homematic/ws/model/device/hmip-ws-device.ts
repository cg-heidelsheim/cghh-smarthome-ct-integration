import type {HMIPWSFunctionalChannel} from './channel/hmip-ws-functional-channel';

/**
 * Base class for devices
 */
export class HMIPWSDevice {
    // The fromJson static factory was moved to src/homematic/ws/model/device/hmip-ws-device-factory.js to break circular dependency

    id: string;
    type: string;
    homeId: string;
    lastStatusUpdate: number;
    label: string;
    functionalChannels: HMIPWSFunctionalChannel[];

    constructor(id: string, type: string, homeId: string, lastStatusUpdate: number, label: string, functionalChannels: HMIPWSFunctionalChannel[]) {
        this.id = id;
        this.type = type;
        this.homeId = homeId;
        this.lastStatusUpdate = lastStatusUpdate;
        this.label = label;
        this.functionalChannels = functionalChannels;
    }
}
