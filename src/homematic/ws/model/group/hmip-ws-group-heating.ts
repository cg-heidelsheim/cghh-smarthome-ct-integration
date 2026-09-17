import {HMIPWSGroup} from './hmip-ws-group';
import type {HMIPWSGroupChannelRef} from './hmip-ws-group-channel-ref';

// Most of these diagnostic/config fields are raw external protocol data never branched on
// elsewhere in this codebase - `unknown` rather than guessing at a precise shape. The three
// consumed downstream (by homematic/group/group-state.builder.ts) are typed as `number`.
interface HMIPWSHeatingGroupParams {
    id: string;
    homeId: string;
    metaGroupId?: unknown;
    label: string;
    lastStatusUpdate: number;
    unreach?: unknown;
    lowBat?: unknown;
    dutyCycle?: unknown;
    channels: HMIPWSGroupChannelRef[];
    sabotage?: unknown;
    processing?: unknown;
    ventilationState?: unknown;
    ventilationLevel?: unknown;
    windowOpenTemperature?: unknown;
    setPointTemperature?: number;
    minTemperature?: unknown;
    maxTemperature?: unknown;
    windowState?: unknown;
    cooling?: unknown;
    partyMode?: unknown;
    controlMode?: unknown;
    controlDifferantialTemperature?: unknown;
    duration?: unknown;
    profiles?: unknown;
    activeProfile?: unknown;
    boostMode?: unknown;
    boostDuration?: unknown;
    actualTemperature?: number;
    humidity?: number;
    coolingAllowed?: unknown;
    coolingIgnored?: unknown;
    ecoAllowed?: unknown;
    ecoIgnored?: unknown;
    controllable?: unknown;
    boostAllowed?: unknown;
    floorHeatingMode?: unknown;
    humidityLimitEnabled?: unknown;
    humidityLimitValue?: unknown;
    humidityLimiterAlarm?: unknown;
    humidityLimitPreEnabled?: unknown;
    humidityLimitPreValue?: unknown;
    humidityLimiterPreAlarm?: unknown;
    externalClockEnabled?: unknown;
    externalClockHeatingTemperature?: unknown;
    externalClockCoolingTemperature?: unknown;
    valvePosition?: unknown;
    valveSilentModeSupported?: unknown;
    valveSilentModeEnabled?: unknown;
    lastSetPointReachedTimestamp?: unknown;
    lastSetPointUpdatedTimestamp?: unknown;
    heatingFailureSupported?: unknown;
    switchClimateFunction?: unknown;
    supportedOptionalFeatures?: unknown;
    switchClimateCoolingEnable?: unknown;
    switchClimateHeatingEnable?: unknown;
    windowOpenTemperatureCooling?: unknown;
    valveActualTemperature?: unknown;
}

/**
 * HEATING group
 */
export class HMIPWSHeatingGroup extends HMIPWSGroup {
    ventilationState?: unknown;
    ventilationLevel?: unknown;
    windowOpenTemperature?: unknown;
    setPointTemperature?: number;
    minTemperature?: unknown;
    maxTemperature?: unknown;
    windowState?: unknown;
    cooling?: unknown;
    partyMode?: unknown;
    controlMode?: unknown;
    controlDifferantialTemperature?: unknown;
    duration?: unknown;
    profiles?: unknown;
    activeProfile?: unknown;
    boostMode?: unknown;
    boostDuration?: unknown;
    actualTemperature?: number;
    humidity?: number;
    coolingAllowed?: unknown;
    coolingIgnored?: unknown;
    ecoAllowed?: unknown;
    ecoIgnored?: unknown;
    controllable?: unknown;
    boostAllowed?: unknown;
    floorHeatingMode?: unknown;
    humidityLimitEnabled?: unknown;
    humidityLimitValue?: unknown;
    humidityLimiterAlarm?: unknown;
    humidityLimitPreEnabled?: unknown;
    humidityLimitPreValue?: unknown;
    humidityLimiterPreAlarm?: unknown;
    externalClockEnabled?: unknown;
    externalClockHeatingTemperature?: unknown;
    externalClockCoolingTemperature?: unknown;
    valvePosition?: unknown;
    valveSilentModeSupported?: unknown;
    valveSilentModeEnabled?: unknown;
    lastSetPointReachedTimestamp?: unknown;
    lastSetPointUpdatedTimestamp?: unknown;
    heatingFailureSupported?: unknown;
    switchClimateFunction?: unknown;
    supportedOptionalFeatures?: unknown;
    switchClimateCoolingEnable?: unknown;
    switchClimateHeatingEnable?: unknown;
    windowOpenTemperatureCooling?: unknown;
    valveActualTemperature?: unknown;

    constructor(params: HMIPWSHeatingGroupParams) {
        super({
            id: params.id,
            homeId: params.homeId,
            metaGroupId: params.metaGroupId,
            label: params.label,
            lastStatusUpdate: params.lastStatusUpdate,
            type: 'HEATING',
            unreach: params.unreach,
            lowBat: params.lowBat,
            dutyCycle: params.dutyCycle,
            channels: params.channels,
            sabotage: params.sabotage
        });

        this.ventilationState = params.ventilationState;
        this.ventilationLevel = params.ventilationLevel;

        this.windowOpenTemperature = params.windowOpenTemperature;
        this.setPointTemperature = params.setPointTemperature;
        this.minTemperature = params.minTemperature;
        this.maxTemperature = params.maxTemperature;
        this.windowState = params.windowState;
        this.cooling = params.cooling;
        this.partyMode = params.partyMode;
        this.controlMode = params.controlMode;
        this.controlDifferantialTemperature = params.controlDifferantialTemperature;
        this.duration = params.duration;
        this.profiles = params.profiles;
        this.activeProfile = params.activeProfile;
        this.boostMode = params.boostMode;
        this.boostDuration = params.boostDuration;
        this.actualTemperature = params.actualTemperature;
        this.humidity = params.humidity;
        this.coolingAllowed = params.coolingAllowed;
        this.coolingIgnored = params.coolingIgnored;
        this.ecoAllowed = params.ecoAllowed;
        this.ecoIgnored = params.ecoIgnored;
        this.controllable = params.controllable;
        this.boostAllowed = params.boostAllowed;
        this.floorHeatingMode = params.floorHeatingMode;
        this.humidityLimitEnabled = params.humidityLimitEnabled;
        this.humidityLimitValue = params.humidityLimitValue;
        this.humidityLimiterAlarm = params.humidityLimiterAlarm;
        this.humidityLimitPreEnabled = params.humidityLimitPreEnabled;
        this.humidityLimitPreValue = params.humidityLimitPreValue;
        this.humidityLimiterPreAlarm = params.humidityLimiterPreAlarm;
        this.externalClockEnabled = params.externalClockEnabled;
        this.externalClockHeatingTemperature = params.externalClockHeatingTemperature;
        this.externalClockCoolingTemperature = params.externalClockCoolingTemperature;
        this.valvePosition = params.valvePosition;
        this.valveSilentModeSupported = params.valveSilentModeSupported;
        this.valveSilentModeEnabled = params.valveSilentModeEnabled;
        this.lastSetPointReachedTimestamp = params.lastSetPointReachedTimestamp;
        this.lastSetPointUpdatedTimestamp = params.lastSetPointUpdatedTimestamp;
        this.heatingFailureSupported = params.heatingFailureSupported;
        this.switchClimateFunction = params.switchClimateFunction;
        this.supportedOptionalFeatures = params.supportedOptionalFeatures;
        this.switchClimateCoolingEnable = params.switchClimateCoolingEnable;
        this.switchClimateHeatingEnable = params.switchClimateHeatingEnable;
        this.windowOpenTemperatureCooling = params.windowOpenTemperatureCooling;
        this.valveActualTemperature = params.valveActualTemperature;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any>): HMIPWSHeatingGroup {
        return new HMIPWSHeatingGroup({
            id: json.id,
            homeId: json.homeId,
            metaGroupId: json.metaGroupId,
            label: json.label,
            lastStatusUpdate: json.lastStatusUpdate,
            unreach: json.unreach,
            lowBat: json.lowBat,
            dutyCycle: json.dutyCycle,
            channels: json.channels,
            processing: json.processing,
            ventilationState: json.ventilationState,
            ventilationLevel: json.ventilationLevel,
            windowOpenTemperature: json.windowOpenTemperature,
            setPointTemperature: json.setPointTemperature,
            minTemperature: json.minTemperature,
            maxTemperature: json.maxTemperature,
            windowState: json.windowState,
            cooling: json.cooling,
            partyMode: json.partyMode,
            controlMode: json.controlMode,
            controlDifferantialTemperature: json.controlDifferantialTemperature,
            duration: json.duration,
            profiles: json.profiles,
            activeProfile: json.activeProfile,
            boostMode: json.boostMode,
            boostDuration: json.boostDuration,
            actualTemperature: json.actualTemperature,
            humidity: json.humidity,
            coolingAllowed: json.coolingAllowed,
            coolingIgnored: json.coolingIgnored,
            ecoAllowed: json.ecoAllowed,
            ecoIgnored: json.ecoIgnored,
            controllable: json.controllable,
            boostAllowed: json.boostAllowed,
            floorHeatingMode: json.floorHeatingMode,
            humidityLimitEnabled: json.humidityLimitEnabled,
            humidityLimitValue: json.humidityLimitValue,
            humidityLimiterAlarm: json.humidityLimiterAlarm,
            humidityLimitPreEnabled: json.humidityLimitPreEnabled,
            humidityLimitPreValue: json.humidityLimitPreValue,
            humidityLimiterPreAlarm: json.humidityLimiterPreAlarm,
            externalClockEnabled: json.externalClockEnabled,
            externalClockHeatingTemperature:
            json.externalClockHeatingTemperature,
            externalClockCoolingTemperature:
            json.externalClockCoolingTemperature,
            valvePosition: json.valvePosition,
            sabotage: json.sabotage,
            valveSilentModeSupported: json.valveSilentModeSupported,
            valveSilentModeEnabled: json.valveSilentModeEnabled,
            lastSetPointReachedTimestamp:
            json.lastSetPointReachedTimestamp,
            lastSetPointUpdatedTimestamp:
            json.lastSetPointUpdatedTimestamp,
            heatingFailureSupported: json.heatingFailureSupported,
            switchClimateFunction: json.switchClimateFunction,
            supportedOptionalFeatures: json.supportedOptionalFeatures,
            switchClimateCoolingEnable: json.switchClimateCoolingEnable,
            switchClimateHeatingEnable: json.switchClimateHeatingEnable,
            windowOpenTemperatureCooling: json.windowOpenTemperatureCooling,
            valveActualTemperature: json.valveActualTemperature
        });
    }
}
