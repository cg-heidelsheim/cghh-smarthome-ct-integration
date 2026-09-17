import {HMIPWSHomeWeather} from './hmip-ws-weather';
import {HMIPWSHomeLocation} from './hmip-ws-home-location';

// Almost all of these are raw external protocol fields never branched on elsewhere in this
// codebase - `unknown` rather than guessing at a precise shape. `weather`/`location`/`id`
// ARE consumed downstream (by homematic-event-listener.ts and weather-state.builder.ts),
// so those get real types.
interface HMIPWSHomeParams {
    weather: HMIPWSHomeWeather | null;
    metaGroups: unknown[];
    clients: unknown[];
    connected?: unknown;
    currentAPVersion?: unknown;
    availableAPVersion?: unknown;
    timeZoneId?: unknown;
    location: HMIPWSHomeLocation | null;
    pinAssigned?: unknown;
    pinChangeTimestamp?: unknown;
    pinChangeClientLabel?: unknown;
    userRightsManagementActive?: unknown;
    liveUpdateSupported?: unknown;
    dutyCycle?: unknown;
    carrierSense?: unknown;
    updateState?: unknown;
    powerMeterUnitPrice?: unknown;
    powerMeterCurrency?: unknown;
    deviceUpdateStrategy?: unknown;
    lastReadyForUpdateTimestamp?: unknown;
    functionalHomes?: unknown;
    inboxGroup?: unknown;
    apExchangeClientId?: unknown;
    apExchangeState?: unknown;
    voiceControlSettings?: unknown;
    ruleGroups?: unknown;
    ruleMetaDatas?: unknown;
    liveOTAUStatus?: unknown;
    accessPointUpdateStates?: unknown;
    accountLinkingStatus?: unknown;
    userRightsManagementActiveChangeStatus?: unknown;
    accountLinkingStatuses?: unknown;
    linkedExternalServices?: unknown;
    accountLinkingStatusSet?: unknown;
    externalServiceAccountLinkings?: unknown;
    pluginInformationMap?: unknown;
    pendingDeviceExchanges?: unknown;
    deviceExchangeErrors?: unknown;
    deviceExchangeHistoryEntries?: unknown;
    notEntireExcludedAccessPoints?: unknown;
    homeExtension?: unknown;
    exchangeTimestamp?: unknown;
    fixedDefaultGroups?: unknown;
    deviceDebugLoggingAllowed?: unknown;
    residentGroups?: unknown;
    geofenceLocations?: unknown;
    conciergeAvatarIcon?: unknown;
    supportedOptionalFeatures?: unknown;
    userRightsManagementSupported?: unknown;
    hueLinkingSupported?: unknown;
    externalServiceSupportingMap?: unknown;
    measuringBaseURL?: unknown;
    id: string;
}

/**
 * HOME object for HOME_CHANGED
 * (This is large; we keep some nested maps as-is but it’s structurally sound)
 */
export class HMIPWSHome {
    weather: HMIPWSHomeWeather | null;
    metaGroups: unknown[];
    clients: unknown[];
    connected?: unknown;
    currentAPVersion?: unknown;
    availableAPVersion?: unknown;
    timeZoneId?: unknown;
    location: HMIPWSHomeLocation | null;
    pinAssigned?: unknown;
    pinChangeTimestamp?: unknown;
    pinChangeClientLabel?: unknown;
    userRightsManagementActive?: unknown;
    liveUpdateSupported?: unknown;
    dutyCycle?: unknown;
    carrierSense?: unknown;
    updateState?: unknown;
    powerMeterUnitPrice?: unknown;
    powerMeterCurrency?: unknown;
    deviceUpdateStrategy?: unknown;
    lastReadyForUpdateTimestamp?: unknown;
    functionalHomes?: unknown;
    inboxGroup?: unknown;
    apExchangeClientId?: unknown;
    apExchangeState?: unknown;
    voiceControlSettings?: unknown;
    ruleGroups?: unknown;
    ruleMetaDatas?: unknown;
    liveOTAUStatus?: unknown;
    accessPointUpdateStates?: unknown;
    accountLinkingStatus?: unknown;
    userRightsManagementActiveChangeStatus?: unknown;
    accountLinkingStatuses?: unknown;
    linkedExternalServices?: unknown;
    accountLinkingStatusSet?: unknown;
    externalServiceAccountLinkings?: unknown;
    pluginInformationMap?: unknown;
    pendingDeviceExchanges?: unknown;
    deviceExchangeErrors?: unknown;
    deviceExchangeHistoryEntries?: unknown;
    notEntireExcludedAccessPoints?: unknown;
    homeExtension?: unknown;
    exchangeTimestamp?: unknown;
    fixedDefaultGroups?: unknown;
    deviceDebugLoggingAllowed?: unknown;
    residentGroups?: unknown;
    geofenceLocations?: unknown;
    conciergeAvatarIcon?: unknown;
    supportedOptionalFeatures?: unknown;
    userRightsManagementSupported?: unknown;
    hueLinkingSupported?: unknown;
    externalServiceSupportingMap?: unknown;
    measuringBaseURL?: unknown;
    id: string;

    constructor(params: HMIPWSHomeParams) {
        this.weather = params.weather;
        this.metaGroups = params.metaGroups;
        this.clients = params.clients;
        this.connected = params.connected;
        this.currentAPVersion = params.currentAPVersion;
        this.availableAPVersion = params.availableAPVersion;
        this.timeZoneId = params.timeZoneId;
        this.location = params.location;
        this.pinAssigned = params.pinAssigned;
        this.pinChangeTimestamp = params.pinChangeTimestamp;
        this.pinChangeClientLabel = params.pinChangeClientLabel;
        this.userRightsManagementActive = params.userRightsManagementActive;
        this.liveUpdateSupported = params.liveUpdateSupported;
        this.dutyCycle = params.dutyCycle;
        this.carrierSense = params.carrierSense;
        this.updateState = params.updateState;
        this.powerMeterUnitPrice = params.powerMeterUnitPrice;
        this.powerMeterCurrency = params.powerMeterCurrency;
        this.deviceUpdateStrategy = params.deviceUpdateStrategy;
        this.lastReadyForUpdateTimestamp =
            params.lastReadyForUpdateTimestamp;
        this.functionalHomes = params.functionalHomes;
        this.inboxGroup = params.inboxGroup;
        this.apExchangeClientId = params.apExchangeClientId;
        this.apExchangeState = params.apExchangeState;
        this.voiceControlSettings = params.voiceControlSettings;
        this.ruleGroups = params.ruleGroups;
        this.ruleMetaDatas = params.ruleMetaDatas;
        this.liveOTAUStatus = params.liveOTAUStatus;
        this.accessPointUpdateStates = params.accessPointUpdateStates;
        this.accountLinkingStatus = params.accountLinkingStatus;
        this.userRightsManagementActiveChangeStatus =
            params.userRightsManagementActiveChangeStatus;
        this.accountLinkingStatuses = params.accountLinkingStatuses;
        this.linkedExternalServices = params.linkedExternalServices;
        this.accountLinkingStatusSet = params.accountLinkingStatusSet;
        this.externalServiceAccountLinkings =
            params.externalServiceAccountLinkings;
        this.pluginInformationMap = params.pluginInformationMap;
        this.pendingDeviceExchanges = params.pendingDeviceExchanges;
        this.deviceExchangeErrors = params.deviceExchangeErrors;
        this.deviceExchangeHistoryEntries =
            params.deviceExchangeHistoryEntries;
        this.notEntireExcludedAccessPoints =
            params.notEntireExcludedAccessPoints;
        this.homeExtension = params.homeExtension;
        this.exchangeTimestamp = params.exchangeTimestamp;
        this.fixedDefaultGroups = params.fixedDefaultGroups;
        this.deviceDebugLoggingAllowed = params.deviceDebugLoggingAllowed;
        this.residentGroups = params.residentGroups;
        this.geofenceLocations = params.geofenceLocations;
        this.conciergeAvatarIcon = params.conciergeAvatarIcon;
        this.supportedOptionalFeatures = params.supportedOptionalFeatures;
        this.userRightsManagementSupported =
            params.userRightsManagementSupported;
        this.hueLinkingSupported = params.hueLinkingSupported;
        this.externalServiceSupportingMap =
            params.externalServiceSupportingMap;
        this.measuringBaseURL = params.measuringBaseURL;
        this.id = params.id;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external WS protocol JSON boundary
    static fromJson(json: Record<string, any> | undefined | null): HMIPWSHome {
        if (!json) {
            throw new Error('HMIPWSHome.fromJson: home json missing');
        }

        const weather = json.weather
            ? new HMIPWSHomeWeather(json.weather)
            : null;
        const location = json.location
            ? new HMIPWSHomeLocation(json.location)
            : null;

        // What you *really* care about here is likely functionalHomes etc.
        const functionalHomes = json.functionalHomes || {};

        return new HMIPWSHome({
            weather,
            metaGroups: json.metaGroups || [],
            clients: json.clients || [],
            connected: json.connected,
            currentAPVersion: json.currentAPVersion,
            availableAPVersion: json.availableAPVersion,
            timeZoneId: json.timeZoneId,
            location,
            pinAssigned: json.pinAssigned,
            pinChangeTimestamp: json.pinChangeTimestamp,
            pinChangeClientLabel: json.pinChangeClientLabel,
            userRightsManagementActive: json.userRightsManagementActive,
            liveUpdateSupported: json.liveUpdateSupported,
            dutyCycle: json.dutyCycle,
            carrierSense: json.carrierSense,
            updateState: json.updateState,
            powerMeterUnitPrice: json.powerMeterUnitPrice,
            powerMeterCurrency: json.powerMeterCurrency,
            deviceUpdateStrategy: json.deviceUpdateStrategy,
            lastReadyForUpdateTimestamp: json.lastReadyForUpdateTimestamp,
            functionalHomes,
            inboxGroup: json.inboxGroup,
            apExchangeClientId: json.apExchangeClientId,
            apExchangeState: json.apExchangeState,
            voiceControlSettings: json.voiceControlSettings,
            ruleGroups: json.ruleGroups,
            ruleMetaDatas: json.ruleMetaDatas,
            liveOTAUStatus: json.liveOTAUStatus,
            accessPointUpdateStates: json.accessPointUpdateStates,
            accountLinkingStatus: json.accountLinkingStatus,
            userRightsManagementActiveChangeStatus:
            json.userRightsManagementActiveChangeStatus,
            accountLinkingStatuses: json.accountLinkingStatuses,
            linkedExternalServices: json.linkedExternalServices,
            accountLinkingStatusSet: json.accountLinkingStatusSet,
            externalServiceAccountLinkings:
            json.externalServiceAccountLinkings,
            pluginInformationMap: json.pluginInformationMap,
            pendingDeviceExchanges: json.pendingDeviceExchanges,
            deviceExchangeErrors: json.deviceExchangeErrors,
            deviceExchangeHistoryEntries:
            json.deviceExchangeHistoryEntries,
            notEntireExcludedAccessPoints:
            json.notEntireExcludedAccessPoints,
            homeExtension: json.homeExtension,
            exchangeTimestamp: json.exchangeTimestamp,
            fixedDefaultGroups: json.fixedDefaultGroups,
            deviceDebugLoggingAllowed: json.deviceDebugLoggingAllowed,
            residentGroups: json.residentGroups,
            geofenceLocations: json.geofenceLocations,
            conciergeAvatarIcon: json.conciergeAvatarIcon,
            supportedOptionalFeatures: json.supportedOptionalFeatures,
            userRightsManagementSupported:
            json.userRightsManagementSupported,
            hueLinkingSupported: json.hueLinkingSupported,
            externalServiceSupportingMap:
            json.externalServiceSupportingMap,
            measuringBaseURL: json.measuringBaseURL,
            id: json.id
        });
    }
}
