import {DataSender} from './data-sender.base';
import {parseDeviceStateChannelIntoInfluxDataObject} from '../util/homematic-influx.mapper';
import type {DeviceState} from '../db/model/device-state';

/**
 * Device data sender class.
 * Sends parsed device channel information to InfluxDB.
 */
export class DeviceDataSender extends DataSender {

    constructor() {
        super('devices');
    }

    parseData(state: DeviceState, channelIndex: number) {
        const channel = state.channels.find(channel => channel.index === channelIndex);
        if (!channel) {
            throw new Error(`Channel with index ${channelIndex} not found in updatedState.`);
        }

        return parseDeviceStateChannelIntoInfluxDataObject(state, channel);
    }
}
