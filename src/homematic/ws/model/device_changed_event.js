import {HMIPWSEvent} from "./event";
import HMIPWSDevice from "./device";

class HMIPWSDeviceChangedEvent extends HMIPWSEvent {
    /**
     * @param {{pushEventType: string, device: HMIPWSDevice}} rawEvent
     */
    constructor(rawEvent) {
        super(rawEvent);

        /** @type {HMIPWSDevice} */
        this.device = HMIPWSDevice.from(rawEvent.device);
    }
}

module.exports = {HMIPWSDeviceChangedEvent}