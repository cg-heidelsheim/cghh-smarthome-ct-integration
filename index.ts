import moment from './src/util/timezone.bootstrap';

import {execute, resetEverythingIfNotLocked} from './src/churchtools/churchtools-event-cron';
import {startEventListener} from './src/homematic/homematic-event-listener';
import {Uptime} from './uptime';

import {Logger} from './src/util/logger';
import {EnvironmentManager} from './src/util/environment-manager';
import influxDb from './src/timeseries/influx/influx-db';

import {CronJob} from 'cron';

require('dotenv').config();

// InfluxDB writes are buffered (batched/flushed on an interval) and were previously never
// flushed on shutdown, silently losing up to a batch's worth of log/state data on every
// restart or deploy.
let shuttingDown = false;
const shutdown = async (signal: string) => {
    if (shuttingDown) {return;}
    shuttingDown = true;

    Logger.info({tags: {module: 'SERVER', function: 'SHUTDOWN'}, message: `Received ${signal}, flushing InfluxDB writes before exit`});
    job.stop();
    await influxDb.flushAndClose();
    process.exit(0);
};
// `.catch()` on each of these three (also below on `run()`) rather than floating promises:
// none of the underlying calls are expected to reject in practice (executeCron and
// EnvironmentManager already swallow their own errors internally), but leaving an async
// entrypoint uncaught means a single unexpected throw becomes an unhandled promise
// rejection on the process's top level, which can terminate the whole service.
process.on('SIGTERM', () => {
    shutdown('SIGTERM').catch((e) => Logger.error({message: 'Shutdown (SIGTERM) failed: ' + e.message}));
});
process.on('SIGINT', () => {
    shutdown('SIGINT').catch((e) => Logger.error({message: 'Shutdown (SIGINT) failed: ' + e.message}));
});

/**
 * ENTRYPOINT
 */
const job = new CronJob(process.env.CRON_DEFINITION!, () => {
    executeCron().catch((e) => Logger.error({message: 'executeCron (cron tick) failed: ' + e.message}));
});

const executeCron = async () => {
    const generalTags = {module: 'CRON', function: 'GENERAL'};
    Logger.info({tags: generalTags, message: '======= Starting Cronjob ======='});

    const maxTries = 3;
    let resetNotPossible: Record<string, boolean> = {};

    // try reset if failed earlier
    // or its 0 o'clock
    if (moment().hours() === 0 && moment().minutes() === 0 || Object.keys(resetNotPossible).length > 0) {
        for (let count = 1; count <= maxTries; count++) {
            const resetTags = {module: 'CRON', function: 'RESET', attempt: count};
            Logger.info({tags: resetTags, message: 'Starting nightly reset'});

            try {
                resetNotPossible = await resetEverythingIfNotLocked(resetNotPossible);

                if (Object.keys(resetNotPossible).length > 0) {
                    throw new Error(`Cant reset ${Object.keys(resetNotPossible).length} elements`); // gets caught directly
                }

                Logger.info({tags: resetTags, message: 'Finished nightly reset'});
                break;
            } catch (e) {
                if (count === maxTries) {
                    Logger.error({tags: resetTags, message: e.message});
                    Uptime.pingUptime('down', e, 'CRON');
                    break;
                } else {
                    Logger.warn({tags: resetTags, message: e.message});
                }

                await EnvironmentManager.updateServerVariables();
            }
        }
    }

    const tags = {module: 'CRON', function: 'EXECUTE'};
    try {
        await execute();
        Uptime.pingUptime('up', 'OK', 'CRON');
    } catch (e) {
        Logger.error({tags, message: 'Failed event handling: ' + e.message});
        Uptime.pingUptime('down', e, 'CRON');
    }
};

job.start();

const run = async () => {
    const tags = {module: 'SERVER', function: 'START'};
    Logger.info({tags, message: '======= RESTART ======='});
    Logger.info({tags, message: '======= RESTART ======='});
    Logger.info({tags, message: '======= RESTART ======='});
    await EnvironmentManager.updateServerVariables();

    await executeCron();
    startEventListener();
};

run().catch((e) => Logger.error({message: 'Startup (run()) failed: ' + e.message}));
