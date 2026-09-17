import {HMIPWSFunctionalChannel} from './hmip-ws-functional-channel';

interface HMIPWSWallMountedThermostatChannelParams {
    deviceId: string;
    index: number;
    groupIndex: number;
    label: string;
    groups: string[];
    supportedOptionalFeatures: Record<string, unknown>;
    channelRole?: string;
    temperatureOffset?: number;
    setPointTemperature?: number;
    actualTemperature?: number;
    humidity?: number;
    display?: string;
    vaporAmount?: number;
}

/**
 * WALL_MOUNTED_THERMOSTAT_PRO_CHANNEL
 */
export class HMIPWSWallMountedThermostatChannel extends HMIPWSFunctionalChannel {
    channelRole?: string;
    temperatureOffset?: number;
    setPointTemperature?: number;
    actualTemperature?: number;
    humidity?: number;
    display?: string;
    vaporAmount?: number;

    constructor(params: HMIPWSWallMountedThermostatChannelParams) {
        super(
            'WALL_MOUNTED_THERMOSTAT_PRO_CHANNEL',
            params.deviceId,
            params.index,
            params.groupIndex,
            params.label,
            params.groups,
            params.supportedOptionalFeatures
        );

        this.channelRole = params.channelRole;
        this.temperatureOffset = params.temperatureOffset;
        this.setPointTemperature = params.setPointTemperature;
        this.actualTemperature = params.actualTemperature;
        this.humidity = params.humidity;
        this.display = params.display;
        this.vaporAmount = params.vaporAmount;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSWallMountedThermostatChannel {
        const {
            deviceId,
            index,
            groupIndex,
            label,
            groups,
            supportedOptionalFeatures,
            channelRole,
            temperatureOffset,
            setPointTemperature,
            actualTemperature,
            humidity,
            display,
            vaporAmount
        } = json;

        return new HMIPWSWallMountedThermostatChannel({
            deviceId,
            index,
            groupIndex,
            label,
            groups,
            supportedOptionalFeatures,
            channelRole,
            temperatureOffset,
            setPointTemperature,
            actualTemperature,
            humidity,
            display,
            vaporAmount
        });
    }
}
