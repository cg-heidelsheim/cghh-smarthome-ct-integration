import axios from 'axios';
import {Logger} from './src/util/logger';

export class Uptime {
    static pingUptime = (status: string, message: unknown, subject: string) => {
        // Check if not in local/test mode before performing the operation
        if (process.env.ENVIRONMENT === 'production') {
            const url = `${subject === 'CRON' ? process.env.UPTIME_KUMA_CRON_URL : process.env.UPTIME_KUMA_WS_URL}?status=${status}&msg=${message}&ping=`;

            const tags = {module: 'HEALTH', function: 'UPTIME', status, subject};
            axios.get(url)
                .then((_) => {
                    Logger.debug({tags, message: 'Ping sent to uptime'});
                })
                .catch((err) => {
                    Logger.error({tags, message: 'Could not send status to Uptime: ' + err});
                });
        } else {
            // Log that the operation is suppressed in local/test mode
            Logger.core({
                tags: {module: 'HEALTH', function: 'UPTIME'},
                message: `[ENV - ${process.env.ENVIRONMENT}] Dry run: Ping operation is suppressed.`
            });
        }
    };
}
