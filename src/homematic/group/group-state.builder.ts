import {GroupState} from '../../db/model/group-state';
import type {HMIPWSHeatingGroup} from '../ws/model/group/hmip-ws-group-heating';

export class GroupStateBuilder {

    /**
     * Transform a HMIP group object into a group state object for DB storage.
     */
    static fromHomematicGroup(group: HMIPWSHeatingGroup): GroupState {
        const groupState = new GroupState();

        // Non-null assertions, not `?? 0` fallbacks: the source fields are typed optional
        // because the raw WS payload doesn't always populate them, but assigning a real
        // `undefined` through here (rather than coercing to 0) is the original behavior -
        // a fallback would be a real behavior change, not just a type fix.
        groupState.id = group.id;
        groupState.label = group.label;
        groupState.temperature = group.actualTemperature!;
        groupState.setTemperature = group.setPointTemperature!;
        groupState.humidity = group.humidity!;

        return groupState;
    }

    /**
     * Built a dummy object, representing a placeholder for the first save.
     * Contains a label with the value "INIT" that can later be checked for different logging and processing
     *
     * @param id HMIP group id
     */
    static dummyState(id: string): GroupState {
        const groupState = new GroupState();

        groupState.id = id;
        groupState.label = 'INIT';

        return groupState;
    }
}
