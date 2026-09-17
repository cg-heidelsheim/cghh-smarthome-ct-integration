import {ChannelState} from '../../db/model/channel-state';
import {DeviceState} from '../../db/model/device-state';
import {HMIPWSHeatingThermostatChannel} from '../ws/model/device/channel/hmip-ws-functional-channel-heating-thermostat';
import type {HMIPWSHeatingThermostatDevice} from '../ws/model/device/hmip-ws-device-heating-thermostat';

export class DeviceStateBuilder {

    /**
     * Transform a HMIP device object into a device state object for DB storage.
     */
    static fromHomematicDevice(device: HMIPWSHeatingThermostatDevice): DeviceState {
        const deviceState = new DeviceState();

        deviceState.id = device.id;
        deviceState.label = device.label;
        deviceState.channels = (device.functionalChannels || [])
            .filter((ch): ch is HMIPWSHeatingThermostatChannel => ch instanceof HMIPWSHeatingThermostatChannel)
            .map(ch => {
                const outputChannel = new ChannelState();
                outputChannel.index = ch.index;
                // Non-null assertions, not fallbacks: these are optional on the WS type
                // because the raw payload doesn't always populate them, but assigning
                // through a real `undefined` here (rather than coercing) is the original
                // behavior.
                outputChannel.valvePosition = ch.valvePosition!;
                outputChannel.temperature = ch.valveActualTemperature!;
                outputChannel.setTemperature = ch.setPointTemperature!;
                return outputChannel;
            });

        return deviceState;
    }

    /**
     * Built a dummy object, representing a placeholder for the first save.
     * Contains a label with the value "INIT" that can later be checked for different logging and processing
     *
     * @param id HMIP device id
     */
    static dummyState(id: string): DeviceState {
        const deviceState = new DeviceState();

        deviceState.id = id;
        deviceState.label = 'INIT';
        deviceState.channels = [];

        return deviceState;
    }
}
