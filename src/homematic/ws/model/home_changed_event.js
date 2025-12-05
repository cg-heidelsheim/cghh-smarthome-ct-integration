import {HMIPWSEvent} from "./event";
import {HMIPWSHome} from "./home";

class HMIPWSHomeChangedEvent extends HMIPWSEvent {
    /**
     * @param {{pushEventType: string, home: HMIPWSHome}} rawEvent
     */
    constructor(rawEvent) {
        super(rawEvent);

        /** @type {HMIPWSHome} */
        this.home = HMIPWSHome.from(rawEvent.home);
    }
}

module.exports = {HMIPWSHomeChangedEvent}