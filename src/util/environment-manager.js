const {HomematicApi} = require("../homematic/homematic-api");
const {Logger} = require("./logger");

class EnvironmentManager {

    /**
     * Lookup the current server URLs from the Homematic Lookup Endpoint
     *
     * @returns {Promise<void>}
     */
    static async updateServerVariables() {
        let tags = {module: "API", function: "HOMEMATIC_LOOKUP"};

        let homematicAPI = new HomematicApi();
        const response = await homematicAPI.getServerUrls();

        try {
            const oldUrl = process.env.HOMEMATIC_API_URL;
            const newUrl = response["urlREST"] + "/";

            if (oldUrl !== newUrl) {
                Logger.warn({tags, message: "Old URL: " + oldUrl});
                Logger.warn({tags, message: "New URL: " + newUrl});
                process.env.HOMEMATIC_API_URL = newUrl;
            }

            const oldUrlWs = process.env.HOMEMATIC_WS_URL;
            const newUrlWs = response["urlWebSocket"] + "/";

            if (oldUrlWs !== newUrlWs) {
                Logger.warn({tags, message: "Old URL WS: " + oldUrlWs});
                Logger.warn({tags, message: "New URL WS: " + newUrlWs});
                process.env.HOMEMATIC_WS_URL = newUrlWs;
            }
        } catch (e) {
            tags = {...tags, path: "/getHost"};
            const info = {response: e.response?.data};
            Logger.error({tags, message: "Could not execute API request: " + e}, info);

            // throw Error(e);
        }
    }
}

module.exports = {EnvironmentManager}