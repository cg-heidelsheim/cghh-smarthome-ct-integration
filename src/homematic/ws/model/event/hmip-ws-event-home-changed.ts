import {HMIPWSEvent} from './hmip-ws-event';
import {HMIPWSHome} from '../home/hmip-ws-home';

/**
 * HOME_CHANGED event
 */
export class HMIPWSHomeChangedEvent extends HMIPWSEvent {
    home: HMIPWSHome;

    constructor(home: HMIPWSHome) {
        super('HOME_CHANGED');
        this.home = home;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSHomeChangedEvent {
        const home = HMIPWSHome.fromJson(json.home);
        return new HMIPWSHomeChangedEvent(home);
    }
}
