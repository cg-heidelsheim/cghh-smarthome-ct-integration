const {WebsocketManager} = require("../websocket-manager");

const {GroupState} = require("../db/model/group-state");
const {GroupStateDB} = require("../db/group-state.db");
const {GroupStateBuilder} = require("./group/group-state.builder");
const {GroupDataSender} = require("../timeseries/group.data-sender");

const {DeviceState} = require("../db/model/device-state");
const {DeviceStateDB} = require("../db/device-state.db");
const {DeviceStateBuilder} = require("./device/device-state.builder");
const {DeviceDataSender} = require("../timeseries/device.data-sender");

const {WeatherState} = require("../db/model/weather-state");
const {WeatherStateDB} = require("../db/weather-state.db");
const {WeatherStateBuilder} = require("./weather/weather-state.builder");
const {WeatherDataSender} = require("../timeseries/weather.data-sender");

const {EventLogger} = require("../util/event.logger");
const {Logger} = require("../util/logger");

const moment = require('moment-timezone');
const {HMIPWSMessage} = require("./ws/model/hmip-ws-message");
const {HMIPWSGroupChangedEvent} = require("./ws/model/event/hmip-ws-event-group-changed");
const {HMIPWSDeviceChangedEvent} = require("./ws/model/event/hmip-ws-event-device-changed");
const {HMIPWSHomeChangedEvent} = require("./ws/model/event/hmip-ws-event-home-changed");
const {HMIPWSHeatingGroup} = require("./ws/model/group/hmip-ws-group-heating");
const {HMIPWSHeatingThermostatDevice} = require("./ws/model/device/hmip-ws-device-heating-thermostat");
const {HMIPWSHome} = require("./ws/model/home/hmip-ws-home");

moment.tz.setDefault("Europe/Berlin");

require("dotenv").config();

const startEventListener = () => {
    const websocketManager = new WebsocketManager(process.env.HOMEMATIC_WS_URL);
    const headers = {
        'AUTHTOKEN': process.env.HOMEMATIC_API_AUTHTOKEN
    };
    websocketManager.setHeaders(headers);
    websocketManager.connect(callback).then(_ => console.log("WS Connected 1"));
};

/**
 * Callback function that gets executed when the websocket receives a new event
 *
 * @param {*} data
 */
const callback = (data) => {
    const rawBuffer = data.toString("utf8");
    const jsonData = JSON.parse(rawBuffer);

    const wsMessage = HMIPWSMessage.fromJson(jsonData);
    wsMessage.events.forEach(event => {
        handleElement(event);
    });
};

/**
 * Handle event data send over websocket connection
 *
 * @param {HMIPWSEvent} event
 */
const handleElement = (event) => {
    if (event instanceof HMIPWSGroupChangedEvent) {
        handleGroupChangeEvent(event);
    } else if (event instanceof HMIPWSDeviceChangedEvent) {
        handleDeviceChanged(event);
    } else if (event instanceof HMIPWSHomeChangedEvent) {
        handleHomeChangeEvent(event);
    }
};

/**
 * Parse update group data object.
 * Determine if is heating group.
 * Determine if values did change.
 *
 * Initialize data send
 *
 * @param {HMIPWSGroupChangedEvent} event
 */
const handleGroupChangeEvent = (event) => {
    const group = event.group;

    if (!(group instanceof HMIPWSHeatingGroup)) return;

    const groupStateDB = new GroupStateDB();

    let currentGroupState;

    try {
        currentGroupState = groupStateDB.getById(group.id);
    } catch (error) {
        Logger.warn({message: "No group state could be loaded from disk: " + error});
        currentGroupState = GroupStateBuilder.dummyState(group.id);
    }

    const updatedGroupState = GroupStateBuilder.fromHomematicGroup(group);

    updatedGroupState.lock = currentGroupState.lock;
    handleGroupStateChange(currentGroupState, updatedGroupState);
};

/**
 * Parse update device data object.
 * Determine if is heating thermostat.
 *
 * Initialize data send
 *
 * @param {HMIPWSDeviceChangedEvent} event
 */
const handleDeviceChanged = (event) => {
    const device = event.device;

    if (!(device instanceof HMIPWSHeatingThermostatDevice)) return;

    const deviceStateDb = new DeviceStateDB();

    let currentDeviceState;
    try {
        currentDeviceState = deviceStateDb.getById(device.id);
    } catch (e) {
        Logger.error({message: "Device state not found in db. Error: " + e.message});
        currentDeviceState = DeviceStateBuilder.dummyState(device.id);
    }

    const updatedDeviceState = DeviceStateBuilder.fromHomematicDevice(device);

    handleDeviceStateChange(currentDeviceState, updatedDeviceState);
};

/**
 * Parse updated home state.
 * Determine if weather information is present.
 *
 * Initialize data send
 *
 * @param {*} event
 */
const handleHomeChangeEvent = (event) => {
    const rawHome = event.home;

    if (!rawHome) return;

    const home = HMIPWSHome.fromJson(rawHome);

    const weatherStateDb = new WeatherStateDB();

    let currentWeatherState;
    try {
        currentWeatherState = weatherStateDb.getById(home.location.city.split(",")[0]);
    } catch (e) {
        Logger.error({message: "Weather state not found in db. Error: " + e.message});
        currentWeatherState = WeatherStateBuilder.dummyState();
    }

    const updatedWeatherState = WeatherStateBuilder.fromHomematicHome(home);

    handleWeatherStateChange(currentWeatherState, updatedWeatherState);
};

/**
 *
 * @param {GroupState} currentState
 * @param {GroupState} updatedState
 * @returns
 */
const handleGroupStateChange = (currentState, updatedState) => {
    if (currentState.equalsValueAttributes(updatedState)) return;

    const dataSender = new GroupDataSender();
    dataSender.sendData(updatedState);

    const groupStateDB = new GroupStateDB();
    groupStateDB.save(updatedState);

    EventLogger.wsGroupChange(currentState, updatedState);
};

/**
 * @param {DeviceState} currentState
 * @param {DeviceState} updatedState
 * @returns
 */
const handleDeviceStateChange = (currentState, updatedState) => {
    const deviceStateDB = new DeviceStateDB();

    updatedState.channels
        .forEach(
            (updatedChannel) => {
                const channelIndex = updatedChannel.index;
                const currentChannel = currentState.getChannelByIndex(channelIndex);

                if (updatedChannel.equalsValueAttributes(currentChannel)) return;

                const dataSender = new DeviceDataSender();
                dataSender.sendData(updatedState, channelIndex);

                EventLogger.wsDeviceUpdateDebug(currentState, updatedState, channelIndex);
            }
        );

    deviceStateDB.save(updatedState);
};

/**
 * @param {WeatherState} currentState
 * @param {WeatherState} updatedState
 * @returns
 */
const handleWeatherStateChange = (currentState, updatedState) => {
    if (currentState.equalsValueAttributes(updatedState)) return;

    const dataSender = new WeatherDataSender();
    dataSender.sendData(currentState, updatedState);

    const weatherStateDB = new WeatherStateDB();
    weatherStateDB.save(updatedState);

    EventLogger.weatherUpdateDebug(currentState, updatedState);
};

module.exports = {startEventListener};
