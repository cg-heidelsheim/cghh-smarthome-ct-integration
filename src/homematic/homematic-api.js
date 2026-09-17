const axios = require('axios');
const {Logger} = require('../util/logger');

require('dotenv').config();

class HomematicApi {
    LOOKUP_URL = process.env.HOMEMATIC_LOOKUP_URL;
    API_URL = process.env.HOMEMATIC_API_URL;

    ACCESS_POINT_ID = process.env.HOMEMATIC_ACCESS_POINT_ID;

    AUTH_TOKEN = process.env.HOMEMATIC_API_AUTHTOKEN;

    /**
     * Update the temperature for a group by its ID
     *
     * @param {string} groupId
     * @param {number} desiredTemperature
     * @returns
     */
    async setTemperatureForGroup(groupId, desiredTemperature) {
        const tags = {module: 'API', function: 'HOMEMATIC', group: groupId};

        if (process.env.ENVIRONMENT !== 'production') {
            Logger.core({
                tags,
                message: `[ENV - ${process.env.ENVIRONMENT}] Dry run: Would set temperature of ${groupId} to ${desiredTemperature}`
            });
            return;
        }

        Logger.debug({tags, message: `Set temperature of ${groupId} to ${desiredTemperature}`});

        return await this.callRest(this.API_URL + 'hmip/group/heating/setSetPointTemperature', {
            groupId,
            'setPointTemperature': desiredTemperature
        });
    }

    async getServerUrls() {
        const tags = {module: 'API', function: 'HOMEMATIC_LOOKUP'};
        Logger.debug({tags, message: 'Fetching Server URL for Homematic API'});

        return await this.callRest(this.LOOKUP_URL + 'getHost', {
            'clientCharacteristics': {
                'apiVersion': '10',
                'applicationIdentifier': 'homematicip-python',
                'applicationVersion': '1.0',
                'deviceManufacturer': 'none',
                'deviceType': 'Computer',
                'language': 'de-DE',
                'osType': 'Windows',
                'osVersion': '10'
            },
            'id': this.ACCESS_POINT_ID
        });
    }

    // Bounded exponential backoff: 5s, 10s, 20s, 40s, capped at 60s. Replaces a previous
    // formula (Math.pow(5000, attempt * 0.5)) that grew from ~71ms to 20+ days across
    // attempts instead of a sane progression.
    static RETRY_BASE_MS = 5000;
    static RETRY_MAX_MS = 60000;

    async callRest(url, payload, attempt = 1, id = null) {
        if (id == null) {
            id = (Math.random() + 1).toString(36).substring(7);
        }

        const maxRetries = 5;
        const headers = {
            'content-type': 'application/json',
            'accept': 'application/json',
            'version': '12',
            'authtoken': this.AUTH_TOKEN
        };

        const tags = {module: 'API', function: 'HOMEMATIC', attempt, identifier: id, url};
        const info = {request: payload};

        try {
            Logger.debug({tags, message: 'Calling ' + url});
            const response = await axios.post(url, payload, {headers});
            Logger.debug({tags, message: 'Api call succeeded'});

            return response.data;
        } catch (e) {
            info.response = e.response?.data;

            if (attempt > maxRetries) {
                Logger.error({tags, message: 'Could not execute API request: ' + e}, info);
                throw Error(e);
            }

            const retryInMs = Math.min(
                HomematicApi.RETRY_BASE_MS * 2 ** (attempt - 1),
                HomematicApi.RETRY_MAX_MS
            );

            Logger.warn({tags, message: 'Could not execute API request: ' + e}, info);
            Logger.warn({tags, message: 'Retrying in ' + retryInMs + ' ms'}, info);

            // Previously fire-and-forget (setTimeout without awaiting the recursive call),
            // so the original caller's await resolved as `undefined` after just the first
            // failure, treating a still-in-progress retry chain as success. Now the retry
            // is awaited end-to-end, so a caller only sees success once the API call
            // actually succeeds, and only sees the final failure once retries are exhausted.
            await new Promise((resolve) => setTimeout(resolve, retryInMs));

            Logger.warn({tags: {...tags, attempt: attempt + 1}, message: 'Retrying request'}, info);
            return this.callRest(url, payload, attempt + 1, id);
        }
    }
}

module.exports = {HomematicApi};
