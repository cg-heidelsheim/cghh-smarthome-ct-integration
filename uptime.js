const axios = require('axios');
const { Logger } = require('./src/util/logger');

class Uptime {
    static pingUptime = (status, message, subject) => {
        // Check if not in local/test mode before performing the operation
        if (process.env.ENVIRONMENT === 'production') {
            let url = `${subject === "CRON" ? process.env.UPTIME_KUMA_CRON_URL : process.env.UPTIME_KUMA_WS_URL}?status=${status}&msg=${message}&ping=`;

            const tags = {module: "HEALTH", function: "UPTIME", status, subject};
            axios.get(url)
                .then((_) => {
                    Logger.debug({ tags, message: "Ping sent to uptime" });
                })
                .catch((err) => {
                    Logger.error({ tags, message: "Could not send status to Uptime: " + err });
                });
        } else {
            // Log that the operation is suppressed in local/test mode
            Logger.info({ module: "HEALTH", function: "UPTIME", message: "Test/Local mode: Ping operation is suppressed." });
        }
    };
}

module.exports = { Uptime };
