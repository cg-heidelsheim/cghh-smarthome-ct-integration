import moment from './timezone.bootstrap';
import {PendingLogDB} from '../db/pending-log.db';
import {Logger} from './logger';
import type {GroupState} from '../db/model/group-state';
import type {DeviceState} from '../db/model/device-state';
import type {WeatherState} from '../db/model/weather-state';
import type {ChannelState} from '../db/model/channel-state';
import type {Lock} from '../db/model/lock';
import type {Event} from '../churchtools/model/event';

// `state` is `any` rather than a shared narrow type: the three real logFn implementations
// (group/device/weather) each take a different concrete *State type, and passing them by
// reference here is contravariant in their parameter types - a shared supertype would need
// to be at least as wide as the narrowest of the three, which isn't useful to express.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrePostLogFn = (fromTo: string, state: any, ...extra: any[]) => void;

/**
 * This class is the main Logging Class for actions that the automated Script has made
 *
 * TODO MAKE 2
 */
export class EventLogger {

    static heatingTimeExpectancy(minutes: number, minPreOfBooking: number, groupState: GroupState) {
        const tags = {module: 'CRON', function: 'EXECUTE', group: groupState.label.replace(/ /g, '_')};
        const message = `[#] Preheating takes ~ ${Math.round(minutes)} min. (incl. ${minPreOfBooking || 0} min. offset)}`;
        Logger.core({tags, message});
    }

    static resolveLock(name: string, desiredTemperature: number, lock: Lock) {
        const tags = {module: 'CRON', function: 'EXECUTE', group: name.replace(/ /g, '_')};
        const message = `[-] '${name}' to ${desiredTemperature}°C for '${lock.eventName}' ending at ${this.ft(lock.expiring)}`;
        Logger.core({tags, message});
    }

    static groupUpdatePreheat(roomName: string, desiredTemperature: number, event: Event) {
        const tags = {module: 'CRON', function: 'EXECUTE', group: roomName.replace(/ /g, '_')};
        const message = `[+] '${roomName}' to ${desiredTemperature}°C for '${event.name}' starting ${this.ft(event.startDate)}`;
        Logger.core({tags, message});
    }

    static groupUpdatePreheatBlocked(eventName: string, roomName: string) {
        const tags = {module: 'CRON', function: 'EXECUTE', group: roomName.replace(/ /g, '_')};
        const message = `[#] '${roomName}' preheating is blocked for event '${eventName}' due to manual temperature override`;
        Logger.core({tags, message});
    }

    static wsGroupChangeCore(currentState: GroupState, updatedState: GroupState) {
        if (currentState.setTemperature === updatedState.setTemperature) {
            return;
        }

        const pendingLogsManager = new PendingLogDB();

        // No pending log is the common case (a manual change) and isn't logged as
        // anything notable; a genuine DB read failure is logged but still treated as
        // "no pending log" rather than thrown, since this runs on the live WS path with
        // no surrounding try/catch.
        let pendingObj;
        try {
            pendingObj = pendingLogsManager.tryGetById(currentState.id);
        } catch (err) {
            Logger.debug({message: 'Pending Log DB read failed: ' + err.message});
        }

        let tags: Record<string, unknown> = {
            module: 'WS',
            function: 'GROUP_UPDATE',
            group: currentState.label.replace(/\s/g, ''),
            type: (pendingObj ? 'AUTO' : 'MANU'),
        };

        if (pendingObj) {
            tags = {...tags, event: pendingObj.eventName.replace(/\s/g, '')};
        }
        const message = `${currentState.label} - Changed setTemperature from ${currentState.setTemperature} to ${updatedState.setTemperature}`;
        Logger.core({tags, message});

        // resolve pending log
        if (pendingObj) {pendingLogsManager.deleteById(currentState.id);}
    }

    /**
     * For an update, first send the current state with the label "PRE", and then the new state with the label "POST"
     */
    static wsGroupChange(currentState: GroupState, updatedState: GroupState) {
        EventLogger.wsGroupChangeCore(currentState, updatedState);
        EventLogger.wsGroupChangeDebug(currentState, updatedState);
    }

    /**
     * Shared "log PRE then POST, or just INIT on the first-ever update" shape behind
     * wsGroupChangeDebug/wsDeviceUpdateDebug/weatherUpdateDebug, previously three
     * independent copies of the same isInitialUpdate branching.
     *
     * @param preExtraArgs   extra args to append after `currentState` for the PRE call
     * @param postExtraArgs  extra args to append after `updatedState` for the POST/INIT call
     * @param skipPre        force-skip the PRE call even for a non-initial update
     */
    static #logPrePost(
        currentState: {label: string}, updatedState: {label: string}, logFn: PrePostLogFn,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous extra args, see PrePostLogFn above
        preExtraArgs: any[] = [], postExtraArgs: any[] = [], skipPre = false
    ) {
        const isInitialUpdate = currentState.label === 'INIT';
        if (!isInitialUpdate && !skipPre) {
            logFn('PRE', currentState, ...preExtraArgs);
        }

        const fromTo = isInitialUpdate ? 'INIT' : 'POST';
        logFn(fromTo, updatedState, ...postExtraArgs);
    }

    static wsGroupChangeDebug(currentState: GroupState, updatedState: GroupState) {
        this.#logPrePost(currentState, updatedState, this.wsGroupStateToInfluxLog);
    }

    static wsDeviceUpdateDebug(currentState: DeviceState, updatedState: DeviceState, channelIndex: number) {
        const currentChannel = currentState.channels.find(channel => channel.index === channelIndex);
        const updatedChannel = updatedState.channels.find(channel => channel.index === channelIndex);

        // currentChannel can legitimately be missing (a channel index appearing for the
        // first time on an otherwise-already-known device) now that the lookup is a real
        // comparison rather than the old assignment bug, which always matched *something*.
        this.#logPrePost(
            currentState, updatedState, this.wsDeviceStateToInfluxLog,
            [currentChannel], [updatedChannel], !currentChannel
        );
    }

    static weatherUpdateDebug(currentState: WeatherState, updatedState: WeatherState) {
        this.#logPrePost(currentState, updatedState, this.wsWeatherToInfluxLog);
    }

    static wsGroupStateToInfluxLog(fromTo: string, groupState: GroupState) {
        let message = groupState.label;

        if (groupState.setTemperature) {message += ` - SetTemp: ${groupState.setTemperature.toFixed(1)}`;}
        if (groupState.temperature) {message += ` - CurrTemp: ${groupState.temperature.toFixed(1)}`;}
        if (groupState.humidity) {message += ` - Humidity: ${groupState.humidity.toFixed(1)}`;}

        const tags = {
            module: 'WS',
            function: 'GROUP_UPDATE',
            group: groupState.label.replace(/ /g, '_'),
            snapshot: fromTo
        };

        Logger.debug({tags, message});
    }

    static wsDeviceStateToInfluxLog(fromTo: string, deviceState: DeviceState, channel: ChannelState) {
        let message = deviceState.label;

        if (channel.setTemperature) {message += ` - SetTemp: ${channel.setTemperature.toFixed(1)}`;}
        if (channel.temperature) {message += ` - CurrTemp: ${channel.temperature.toFixed(1)}`;}
        if (channel.valvePosition) {message += ` - ValvePos: ${channel.valvePosition.toFixed(1)}`;}
        if (channel.index) {message += ` - Index: ${channel.index}`;}

        const tags = {
            module: 'WS',
            function: 'DEVICE_UPDATE',
            device: deviceState.label.replace(/ /g, '_'),
            snapshot: fromTo,
            channel: channel.index
        };

        Logger.debug({tags, message});
    }

    static wsWeatherToInfluxLog(fromTo: string, state: WeatherState) {
        let message = `${state.label} CurrTemp: ${state.temperature.toFixed(1)}`;
        message += ` - MinTemp: ${state.minTemperature.toFixed(1)}`;
        message += ` - MaxTemp: ${state.maxTemperature.toFixed(1)}`;
        message += ` - Humidity: ${state.humidity.toFixed(1)}`;
        message += ` - WindSpeed: ${state.windSpeed.toFixed(4)}`;
        message += ` - VaporAmount: ${state.vaporAmount.toFixed(4)}`;
        message += ` - WeatherCond: ${state.weatherCondition}`;
        message += ` - Time: ${state.weatherDayTime}`;

        const tags = {
            module: 'WS',
            function: 'WEATHER_UPDATE',
            location: state.label.replace(/ /g, '_'),
            snapshot: fromTo
        };

        Logger.debug({tags, message});
    }

    static ft = (dateString: string) => {
        return moment(dateString).format('YYYY-MM-DD HH:mm:ss');
    };

    static t = () => {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    };

}
