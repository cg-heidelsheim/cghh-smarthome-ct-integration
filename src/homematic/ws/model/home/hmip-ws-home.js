const {HMIPWSHomeWeather} = require('./hmip-ws-weather');
const {HMIPWSHomeLocation} = require('./hmip-ws-home-location');

/**
 * HOME object for HOME_CHANGED
 * (This is large; we keep some nested maps as-is but it’s structurally sound)
 */
class HMIPWSHome {
    constructor(params) {
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

    /**
     * @param {any} json
     * @returns {HMIPWSHome}
     */
    static fromJson(json) {
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

module.exports = {HMIPWSHome}
