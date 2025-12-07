const axios = require("axios");
const {Logger} = require("../util/logger");

require('dotenv').config();

class HomematicApi {
    LOOKUP_URL = process.env.HOMEMATIC_LOOKUP_URL;
    API_URL = process.env.HOMEMATIC_API_URL;

    ACCESS_POINT_ID = process.env.HOMEMATIC_ACCESS_POINT_ID;

    AUTH_TOKEN = process.env.HOMEMATIC_API_AUTHTOKEN;
    CLIENT_AUTH = process.env.HOMEMATIC_API_CLIENTAUTH;

    /**
     * Update the temperature for a group by its ID
     *
     * @param {string} groupId
     * @param {number} desiredTemperature
     * @returns
     */
    async setTemperatureForGroup(groupId, desiredTemperature) {
        const tags = {module: "API", function: "HOMEMATIC", group: groupId};

        if (process.env.ENVIRONMENT !== 'production') {
            Logger.core({
                tags,
                message: `[ENV - ${process.env.ENVIRONMENT}] Dry run: Would set temperature of ${groupId} to ${desiredTemperature}`
            });
            return;
        }

        Logger.debug({tags, message: `Set temperature of ${groupId} to ${desiredTemperature}`});

        return await this.callRest(this.API_URL + "hmip/group/heating/setSetPointTemperature", {
            "groupId": groupId,
            "setPointTemperature": desiredTemperature
        });
    }

    async getServerUrls() {
        const tags = {module: "API", function: "HOMEMATIC_LOOKUP"};
        Logger.debug({tags, message: "Fetching Server URL for Homematic API"});

        return await this.callRest(this.LOOKUP_URL + "getHost", {
            "clientCharacteristics": {
                "apiVersion": "10",
                "applicationIdentifier": "homematicip-python",
                "applicationVersion": "1.0",
                "deviceManufacturer": "none",
                "deviceType": "Computer",
                "language": "de-DE",
                "osType": "Windows",
                "osVersion": "10"
            },
            "id": this.ACCESS_POINT_ID
        });
    }

    async callRest(url, payload, attempt = 1, id = null) {
        if (id == null) {
            id = (Math.random() + 1).toString(36).substring(7);
        }

        const maxRetries = 5;
        const headers = {
            "content-type": "application/json",
            "accept": "application/json",
            "version": "12",
            "authtoken": this.AUTH_TOKEN,
            "clientauth": this.CLIENT_AUTH,
        };

        let response;

        let tags = {module: "API", function: "HOMEMATIC", attempt, identifier: id, url: url};

        const info = {request: payload};

        try {
            Logger.debug({tags, message: "Calling " + url});
            response = await axios.post(url, payload, {headers});
            Logger.debug({tags, message: "Api call succeeded"});

            return response.data;
        } catch (e) {
            tags = {...tags};
            info.response = e.response?.data;

            if (attempt <= maxRetries) {
                const retryInMs = Math.pow(5000, attempt * 0.5);

                Logger.warn({tags, message: "Could not execute API request: " + e}, info);
                Logger.warn({tags, message: "Retrying in " + retryInMs + " ms"}, info);

                setTimeout(() => {
                    Logger.warn({tags: {...tags, attempt: attempt + 1}, message: "Retrying request"}, info);
                    this.callRest(url, payload, attempt++, id);
                }, retryInMs);
            } else {
                Logger.error({tags, message: "Could not execute API request: " + e}, info);
                throw Error(e);
            }
        }
    }
}

module.exports = {HomematicApi};
