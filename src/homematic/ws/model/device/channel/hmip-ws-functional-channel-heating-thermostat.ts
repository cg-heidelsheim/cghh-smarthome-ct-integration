import {HMIPWSFunctionalChannel} from './hmip-ws-functional-channel';

interface HMIPWSHeatingThermostatChannelParams {
    deviceId: string;
    index: number;
    groupIndex: number;
    label: string;
    groups: string[];
    supportedOptionalFeatures: Record<string, unknown>;
    channelRole?: string;
    temperatureOffset?: number;
    valvePosition?: number;
    setPointTemperature?: number;
    valveState?: string;
    valveActualTemperature?: number;
    boostSignalHue?: number;
    boostSignalSaturation?: number;
    boostSignalLevel?: number;
}

/**
 * HEATING_THERMOSTAT_CHANNEL
 */
export class HMIPWSHeatingThermostatChannel extends HMIPWSFunctionalChannel {
    channelRole?: string;
    temperatureOffset?: number;
    valvePosition?: number;
    setPointTemperature?: number;
    valveState?: string;
    valveActualTemperature?: number;
    boostSignalHue?: number;
    boostSignalSaturation?: number;
    boostSignalLevel?: number;

    constructor(params: HMIPWSHeatingThermostatChannelParams) {
        super(
            'HEATING_THERMOSTAT_CHANNEL',
            params.deviceId,
            params.index,
            params.groupIndex,
            params.label,
            params.groups,
            params.supportedOptionalFeatures
        );

        this.channelRole = params.channelRole;
        this.temperatureOffset = params.temperatureOffset;
        this.valvePosition = params.valvePosition;
        this.setPointTemperature = params.setPointTemperature;
        this.valveState = params.valveState;
        this.valveActualTemperature = params.valveActualTemperature;

        // explicitly mapped extra fields from JSON:
        this.boostSignalHue = params.boostSignalHue;
        this.boostSignalSaturation = params.boostSignalSaturation;
        this.boostSignalLevel = params.boostSignalLevel;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSHeatingThermostatChannel {
        const {
            deviceId,
            index,
            groupIndex,
            label,
            groups,
            supportedOptionalFeatures,
            channelRole,
            temperatureOffset,
            valvePosition,
            setPointTemperature,
            valveState,
            valveActualTemperature,
            boostSignalHue,
            boostSignalSaturation,
            boostSignalLevel
        } = json;

        return new HMIPWSHeatingThermostatChannel({
            deviceId,
            index,
            groupIndex,
            label,
            groups,
            supportedOptionalFeatures,
            channelRole,
            temperatureOffset,
            valvePosition,
            setPointTemperature,
            valveState,
            valveActualTemperature,
            boostSignalHue,
            boostSignalSaturation,
            boostSignalLevel
        });
    }
}
