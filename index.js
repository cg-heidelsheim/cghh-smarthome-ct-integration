const {execute, resetEverythingIfNotLocked} = require('./src/churchtools/churchtools-event-cron');
const {startEventListener} = require('./src/homematic/homematic-event-listener');
const {Uptime} = require('./uptime');

const moment = require('moment-timezone');
moment.tz.setDefault('Europe/Berlin');

const {Logger} = require('./src/util/logger');
const {EnvironmentManager} = require('./src/util/environment-manager');
const influxDb = require('./src/timeseries/influx/influx-db');

const CronJob = require('cron').CronJob;

require('dotenv').config();

// InfluxDB writes are buffered (batched/flushed on an interval) and were previously never
// flushed on shutdown, silently losing up to a batch's worth of log/state data on every
// restart or deploy.
let shuttingDown = false;
const shutdown = async (signal) => {
    if (shuttingDown) {return;}
    shuttingDown = true;

    Logger.info({tags: {module: 'SERVER', function: 'SHUTDOWN'}, message: `Received ${signal}, flushing InfluxDB writes before exit`});
    job.stop();
    await influxDb.flushAndClose();
    process.exit(0);
};
process.on('SIGTERM', () => {
    shutdown('SIGTERM');
});
process.on('SIGINT', () => {
    shutdown('SIGINT');
});

/**
 * ENTRYPOINT
 */
const job = new CronJob(process.env.CRON_DEFINITION, async () => {
    await executeCron();
});

const executeCron = async () => {
    const generalTags = {module: 'CRON', function: 'GENERAL'};
    Logger.info({tags: generalTags, message: '======= Starting Cronjob ======='});

    const maxTries = 3;
    let resetNotPossible = {};

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

run();
