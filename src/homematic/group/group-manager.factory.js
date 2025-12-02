const {GroupStateDB} = require("../../db/group-state.db");
const {RoomConfigurationDB} = require("../../db/room-config.db");
const {GroupManager} = require("./group-manager");
const {HomematicApi} = require("../homematic-api");

class GroupManagerFactory {
    static createGroupManager(groupId) {
        const groupStateDB = new GroupStateDB();
        const roomConfigDB = new RoomConfigurationDB();

        const roomConfig = roomConfigDB.getById(groupId);
        const groupState = groupStateDB.getById(groupId);

        return new GroupManager({
            roomConfiguration: roomConfig,
            roomState: groupState,
            homematicAPI: new HomematicApi(),
        });
    }
}

exports.module = {GroupManagerFactory}