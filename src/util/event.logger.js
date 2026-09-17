const moment = require('moment-timezone');
const {PendingLogDB} = require('../db/pending-log.db');
const {Logger} = require('./logger');
moment.tz.setDefault('Europe/Berlin');

/**
 * This class is the main Logging Class for actions that the automated Script has made
 *
 * TODO MAKE 2
 */
class EventLogger {

    /**
     * @param {number} minutes
     * @param {number} minPreOfBooking
     * @param {GroupState} groupState
     */
    static heatingTimeExpectancy(minutes, minPreOfBooking, groupState) {
        const tags = {module: 'CRON', function: 'EXECUTE', group: groupState.label.replace(/ /g, '_')};
        const message = `[#] Preheating takes ~ ${Math.round(minutes)} min. (incl. ${minPreOfBooking || 0} min. offset)}`;
        Logger.core({tags, message});
    }

    /**
     *
     * @param {string} name
     * @param desiredTemperature
     * @param lock
     */
    static resolveLock(name, desiredTemperature, lock) {
        const tags = {module: 'CRON', function: 'EXECUTE', group: name.replace(/ /g, '_')};
        const message = `[-] '${name}' to ${desiredTemperature}°C for '${lock.eventName}' ending at ${this.ft(lock.expiring)}`;
        Logger.core({tags, message});
    }

    /**
     *
     * @param {string} roomName
     * @param {number} desiredTemperature
     * @param {import('./../churchtools/model/event').Event} event
     */
    static groupUpdatePreheat(roomName, desiredTemperature, event) {
        const tags = {module: 'CRON', function: 'EXECUTE', group: roomName.replace(/ /g, '_')};
        const message = `[+] '${roomName}' to ${desiredTemperature}°C for '${event.name}' starting ${this.ft(event.startDate)}`;
        Logger.core({tags, message});
    }

    static groupUpdatePreheatBlocked(eventName, roomName) {
        const tags = {module: 'CRON', function: 'EXECUTE', group: roomName.replace(/ /g, '_')};
        const message = `[#] '${roomName}' preheating is blocked for event '${eventName}' due to manual temperature override`;
        Logger.core({tags, message});
    }


    /**
     *
     * @param {GroupState} currentState
     * @param {GroupState} updatedState
     */
    static wsGroupChangeCore(currentState, updatedState) {
        if (currentState.setTemperature === updatedState.setTemperature) {
            return;
        }

        const pendingLogsManager = new PendingLogDB();

        let pendingObj;
        try {
            pendingObj = pendingLogsManager.getById(currentState.id);
        } catch (err) {
            Logger.debug({message: 'Pending Log not found: ' + err.message});
        }

        let tags = {
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
     *
     * @param {GroupState} currentState
     * @param {GroupState} updatedState
     */
    static wsGroupChange(currentState, updatedState) {
        EventLogger.wsGroupChangeCore(currentState, updatedState);
        EventLogger.wsGroupChangeDebug(currentState, updatedState);
    }

    /**
     * Shared "log PRE then POST, or just INIT on the first-ever update" shape behind
     * wsGroupChangeDebug/wsDeviceUpdateDebug/weatherUpdateDebug, previously three
     * independent copies of the same isInitialUpdate branching.
     *
     * @param {{label: string}} currentState
     * @param {{label: string}} updatedState
     * @param {(fromTo: string, state: object, ...extra: any[]) => void} logFn
     * @param {any[]} preExtraArgs   extra args to append after `currentState` for the PRE call
     * @param {any[]} postExtraArgs  extra args to append after `updatedState` for the POST/INIT call
     * @param {boolean} skipPre      force-skip the PRE call even for a non-initial update
     */
    static #logPrePost(currentState, updatedState, logFn, preExtraArgs = [], postExtraArgs = [], skipPre = false) {
        const isInitialUpdate = currentState.label === 'INIT';
        if (!isInitialUpdate && !skipPre) {
            logFn('PRE', currentState, ...preExtraArgs);
        }

        const fromTo = isInitialUpdate ? 'INIT' : 'POST';
        logFn(fromTo, updatedState, ...postExtraArgs);
    }

    static wsGroupChangeDebug(currentState, updatedState) {
        this.#logPrePost(currentState, updatedState, this.wsGroupStateToInfluxLog);
    }

    static wsDeviceUpdateDebug(currentState, updatedState, channelIndex) {
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

    static weatherUpdateDebug(currentState, updatedState) {
        this.#logPrePost(currentState, updatedState, this.wsWeatherToInfluxLog);
    }

    static wsGroupStateToInfluxLog(fromTo, groupState) {
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

    static wsDeviceStateToInfluxLog(fromTo, deviceState, channel) {
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

    static wsWeatherToInfluxLog(fromTo, state) {
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

    static ft = (string) => {
        return moment(string).format('YYYY-MM-DD HH:mm:ss');
    };

    static t = () => {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    };

}

module.exports = {EventLogger};