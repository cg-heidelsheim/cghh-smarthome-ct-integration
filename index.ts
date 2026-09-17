import './src/util/timezone.bootstrap';

import {executeCron} from './src/churchtools/churchtools-event-cron';
import {startEventListener} from './src/homematic/homematic-event-listener';
import {startDocsServer} from './src/docs-site/docs-server';

import {Logger} from './src/util/logger';
import {EnvironmentManager} from './src/util/environment-manager';
import influxDb from './src/timeseries/influx/influx-db';

import {CronJob} from 'cron';

require('dotenv').config();

/**
 * ENTRYPOINT - wires up the cron job and the WS listener, and starts them. The actual
 * cron-tick logic lives in src/churchtools/churchtools-event-cron.ts (executeCron()).
 */

// InfluxDB writes are buffered (batched/flushed on an interval) and were previously never
// flushed on shutdown, silently losing up to a batch's worth of log/state data on every
// restart or deploy.
let shuttingDown = false;
const shutdown = async (signal: string) => {
    if (shuttingDown) {return;}
    shuttingDown = true;

    Logger.info({tags: {module: 'SERVER', function: 'SHUTDOWN'}, message: `Received ${signal}, flushing InfluxDB writes before exit`});
    job.stop();
    docsServer.close();
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

const job = new CronJob(process.env.CRON_DEFINITION!, () => {
    executeCron().catch((e) => Logger.error({message: 'executeCron (cron tick) failed: ' + e.message}));
});

job.start();

// Serves the German end-user/developer docs site (see docs/site/) - matches the Dockerfile's
// `EXPOSE 8080`, which had nothing listening on it until now.
const docsServer = startDocsServer(Number(process.env.PORT) || 8080);

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
