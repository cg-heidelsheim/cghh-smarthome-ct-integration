import type {ChannelState} from './channel-state';

/**
 * Represents the state of a device with multiple channels.
 * Usually (the thermostats on the "Heizkörper" itself, only has a single channel)
 *
 * Example JSON representation as stored on disk:
 * {
 *   "id": "301...",
 *   "label": "Heizkörperthermostat - ...",
 *   "channels": [
 *     {
 *       "index": 1,
 *       "valvePosition": 0,
 *       "temperature": 16.0,
 *       "setTemperature": 16
 *     }
 *   ]
 * }
 */
export class DeviceState {

    /** Unique identifier of the device (from Homematic) */
    id!: string;

    /** Label describing the device */
    label!: string;

    /** Array of channel states within the device */
    channels: ChannelState[] = [];

    /**
     * Retrieves a ChannelState by its index.
     *
     * @param index The index of the channel to retrieve.
     * @returns The channel with the specified index, or undefined if not found.
     */
    getChannelByIndex(index: number): ChannelState | undefined {
        return this.channels.find(channel => channel.index === index);
    }
}
