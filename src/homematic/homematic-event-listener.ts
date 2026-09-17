import {WebsocketManager} from '../websocket-manager';

import {GroupStateDB} from '../db/group-state.db';
import {GroupStateBuilder} from './group/group-state.builder';
import {GroupDataSender} from '../timeseries/group.data-sender';

import {DeviceStateDB} from '../db/device-state.db';
import {DeviceStateBuilder} from './device/device-state.builder';
import {DeviceDataSender} from '../timeseries/device.data-sender';

import {WeatherStateDB} from '../db/weather-state.db';
import {WeatherStateBuilder} from './weather/weather-state.builder';
import {WeatherDataSender} from '../timeseries/weather.data-sender';

import {EventLogger} from '../util/event.logger';
import {Logger} from '../util/logger';

import '../util/timezone.bootstrap';
import {HMIPWSMessage} from './ws/model/hmip-ws-message';
import type {HMIPWSEvent} from './ws/model/event/hmip-ws-event';
import {HMIPWSGroupChangedEvent} from './ws/model/event/hmip-ws-event-group-changed';
import {HMIPWSDeviceChangedEvent} from './ws/model/event/hmip-ws-event-device-changed';
import {HMIPWSHomeChangedEvent} from './ws/model/event/hmip-ws-event-home-changed';
import {HMIPWSHeatingGroup} from './ws/model/group/hmip-ws-group-heating';
import {HMIPWSHeatingThermostatDevice} from './ws/model/device/hmip-ws-device-heating-thermostat';
import {HMIPWSHome} from './ws/model/home/hmip-ws-home';
import type {GroupState} from '../db/model/group-state';
import type {DeviceState} from '../db/model/device-state';
import type {WeatherState} from '../db/model/weather-state';
import type WebSocket from 'ws';

require('dotenv').config();

/**
 * Look up an entity's current persisted state, falling back to a placeholder ("dummy") state
 * when it's missing. A missing entry (first time this entity is seen) is normal and silent.
 * A genuine read failure (e.g. a corrupt state file) is logged but still falls back to the
 * dummy state rather than throwing - this whole module runs synchronously inside the WS
 * 'message' handler with no surrounding try/catch, so letting an I/O error escape here would
 * crash the entire live WS listener, not just one update.
 *
 * Extracted because the three call sites below (group/device/weather) repeated this exact
 * try/catch/fallback shape, differing only in which lookup to call, which dummy-state builder
 * to fall back to, and the entity name in the log message.
 */
function tryGetOrDummy<T>(entityName: string, lookup: () => T | null, buildDummy: () => T): T {
    let state: T | null = null;
    try {
        state = lookup();
    } catch (error) {
        Logger.error({message: `${entityName} state DB read failed, using dummy state: ${error}`});
    }
    return state ?? buildDummy();
}

export const startEventListener = () => {
    const websocketManager = new WebsocketManager(process.env.HOMEMATIC_WS_URL!);
    const headers = {
        'AUTHTOKEN': process.env.HOMEMATIC_API_AUTHTOKEN ?? ''
    };
    websocketManager.setHeaders(headers);
    websocketManager.connect(callback)
        .then(_ => console.log('WS Connected 1'))
        // Previously a floating promise with no rejection handler - if the initial connect
        // failed (e.g. EnvironmentManager.updateServerVariables() throwing), it became an
        // unhandled promise rejection. See the equivalent fix in websocket-manager.ts's
        // reconnect path for the same class of issue.
        .catch((error) => Logger.error({message: 'Initial WS connect failed: ' + error.message}));
};

/**
 * Callback function that gets executed when the websocket receives a new event
 */
const callback = (data: WebSocket.RawData) => {
    const rawBuffer = data.toString('utf8');
    const jsonData = JSON.parse(rawBuffer);

    const wsMessage = HMIPWSMessage.fromJson(jsonData);
    wsMessage.events.forEach(event => {
        handleElement(event);
    });
};

/**
 * Handle event data send over websocket connection
 */
const handleElement = (event: HMIPWSEvent | undefined) => {
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
 */
const handleGroupChangeEvent = (event: HMIPWSGroupChangedEvent) => {
    const group = event.group;

    if (!(group instanceof HMIPWSHeatingGroup)) {return;}

    const groupStateDB = new GroupStateDB();

    const currentGroupState = tryGetOrDummy(
        'Group', () => groupStateDB.tryGetById(group.id), () => GroupStateBuilder.dummyState(group.id)
    );

    const updatedGroupState = GroupStateBuilder.fromHomematicGroup(group);

    updatedGroupState.lock = currentGroupState.lock;
    handleGroupStateChange(currentGroupState, updatedGroupState);
};

/**
 * Parse update device data object.
 * Determine if is heating thermostat.
 *
 * Initialize data send
 */
const handleDeviceChanged = (event: HMIPWSDeviceChangedEvent) => {
    const device = event.device;

    if (!(device instanceof HMIPWSHeatingThermostatDevice)) {return;}

    const deviceStateDb = new DeviceStateDB();

    const currentDeviceState = tryGetOrDummy(
        'Device', () => deviceStateDb.tryGetById(device.id), () => DeviceStateBuilder.dummyState(device.id)
    );

    const updatedDeviceState = DeviceStateBuilder.fromHomematicDevice(device);

    handleDeviceStateChange(currentDeviceState, updatedDeviceState);
};

/**
 * Parse updated home state.
 * Determine if weather information is present.
 *
 * Initialize data send
 */
const handleHomeChangeEvent = (event: HMIPWSHomeChangedEvent) => {
    const rawHome = event.home;

    if (!rawHome) {return;}

    const home = HMIPWSHome.fromJson(rawHome);

    const weatherStateDb = new WeatherStateDB();

    const currentWeatherState = tryGetOrDummy(
        'Weather', () => weatherStateDb.tryGetById(home.location!.city.split(',')[0]), () => WeatherStateBuilder.dummyState()
    );

    const updatedWeatherState = WeatherStateBuilder.fromHomematicHome(home);

    handleWeatherStateChange(currentWeatherState, updatedWeatherState);
};

const handleGroupStateChange = (currentState: GroupState, updatedState: GroupState) => {
    if (currentState.equalsValueAttributes(updatedState)) {return;}

    const dataSender = new GroupDataSender();
    dataSender.sendData(updatedState);

    const groupStateDB = new GroupStateDB();
    groupStateDB.save(updatedState);

    EventLogger.wsGroupChange(currentState, updatedState);
};

const handleDeviceStateChange = (currentState: DeviceState, updatedState: DeviceState) => {
    const deviceStateDB = new DeviceStateDB();

    updatedState.channels
        .forEach(
            (updatedChannel) => {
                const channelIndex = updatedChannel.index;
                const currentChannel = currentState.getChannelByIndex(channelIndex);

                if (updatedChannel.equalsValueAttributes(currentChannel!)) {return;}

                const dataSender = new DeviceDataSender();
                dataSender.sendData(updatedState, channelIndex);

                EventLogger.wsDeviceUpdateDebug(currentState, updatedState, channelIndex);
            }
        );

    deviceStateDB.save(updatedState);
};

const handleWeatherStateChange = (currentState: WeatherState, updatedState: WeatherState) => {
    if (currentState.equalsValueAttributes(updatedState)) {return;}

    const dataSender = new WeatherDataSender();
    dataSender.sendData(currentState, updatedState);

    const weatherStateDB = new WeatherStateDB();
    weatherStateDB.save(updatedState);

    EventLogger.weatherUpdateDebug(currentState, updatedState);
};
