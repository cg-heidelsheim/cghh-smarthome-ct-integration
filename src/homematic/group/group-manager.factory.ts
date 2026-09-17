import {GroupStateDB} from '../../db/group-state.db';
import {RoomConfigDB} from '../../db/room-config.db';
import {GroupManager} from './group-manager';
import {HomematicApi} from '../homematic-api';

export class GroupManagerFactory {
    static createGroupManager(groupId: string): GroupManager {
        const groupStateDB = new GroupStateDB();
        const roomConfigDB = new RoomConfigDB();

        const roomConfig = roomConfigDB.getById(groupId);
        const groupState = groupStateDB.getById(groupId);

        return new GroupManager({
            roomConfiguration: roomConfig,
            roomState: groupState,
            homematicAPI: new HomematicApi(),
        });
    }
}
