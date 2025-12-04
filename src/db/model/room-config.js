const {Event} = require("../../churchtools/model/event")
const {EventTemperatureMapper} = require("../../util/event-temperature.mapper");

class RoomConfig {

    id; // CT ID
    name;
    homematicName;
    homematicId; // HMIP ID
    desiredTemperature;
    desiredTemperatureIdle;
    heatingRate;
    spinUpTime;

    /**
     * Calculate the aprox. minutes to heat the room.
     * Calculated by taking the current temperature and room heating rate into account.
     *
     * @param {Event} event
     * @param {GroupState} groupState
     */
    getMinutesNeededToReachTemperatureForEvent(event, groupState) {
        const desiredTemperature = this.getDesiredRoomTemperatureForEvent(event);
        const currentRoomTemperature = groupState.temperature;

        if (!currentRoomTemperature) return 120; // fallback if no current temperature entry is present

        const spinUpTime = this.spinUpTime;
        const minutesPerDegree = this.heatingRate;
        const degreeDifference = desiredTemperature - currentRoomTemperature;

        if (degreeDifference < 0) return 0; // no heating needed

        return spinUpTime + (degreeDifference * minutesPerDegree);
    }

    /**
     * Get the desired temperature for this room in regard to a specific event.
     * Some events require different temperatures than the default desired temperature for the particular room.
     *
     * @param {Event} event
     * @return {number} Temperature in °C
     */
    getDesiredRoomTemperatureForEvent(event) {
        let temperature = EventTemperatureMapper.getDesiredTemperatureForEvent(event.name);

        if (!temperature) {
            temperature = this.desiredTemperature;
        }

        return temperature;
    }
}

module.exports = {RoomConfig};