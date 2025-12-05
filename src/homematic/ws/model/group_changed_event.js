import {HMIPWSEvent} from "./event";
import HMIPWSGroup from "./group";

class HMIPWSGroupChangedEvent extends HMIPWSEvent {
    /**
     * @param {{pushEventType: string, group: HMIPWSGroup}} rawEvent
     */
    constructor(rawEvent) {
        super(rawEvent);

        /** @type {HMIPWSGroup} */
        this.group = HMIPWSGroup.from(rawEvent.group);
    }
}

module.exports = {HMIPWSGroupChangedEvent}