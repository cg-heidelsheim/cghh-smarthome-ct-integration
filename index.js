const { execute, resetEverythingIfNotLocked } = require("./src/churchtools/churchtools-event-cron");
const { startEventListener } = require("./src/homematic/homematic-event-listener");
const { Uptime } = require("./uptime");

const moment = require('moment-timezone');
moment.tz.setDefault("Europe/Berlin");

const { Logger } = require("./src/util/logger");
const {EnvironmentManager} = require("./src/util/environment-manager");

const CronJob = require('cron').CronJob;

require('dotenv').config();

/**
 * ENTRYPOINT
 */
const job = new CronJob(process.env.CRON_DEFINITION, async () => { await executeCron(); });

const executeCron = async () => {
    const generalTags = { module: "CRON", function: "GENERAL" };
    Logger.info({ tags: generalTags, message: "======= Starting Cronjob =======" });

    const maxTries = 3;
    let resetNotPossible = {};

    // try reset if failed earlier
    // or its 0 o'clock
    if (moment().hours() === 0 && moment().minutes() === 0 || Object.keys(resetNotPossible).length > 0) {
        for (let count = 1; count <= maxTries; count++) {
            let resetTags = { module: "CRON", function: "RESET", attempt: count };
            Logger.info({ tags: resetTags, message: "Starting nightly reset" });

            try {
                resetNotPossible = await resetEverythingIfNotLocked(resetNotPossible);

                if (Object.keys(resetNotPossible).length > 0) {
                    throw new Error(`Cant reset ${Object.keys(resetNotPossible).length} elements`); // gets caught directly
                }

                Logger.info({ tags: resetTags, message: "Finished nightly reset" });
                break;
            } catch (e) {
                if (count === maxTries) {
                    Logger.error({ tags: resetTags, message: e.message });
                    Uptime.pingUptime("down", e, "CRON");
                    break;
                } else {
                    Logger.warn({ tags: resetTags, message: e.message });
                }

                await EnvironmentManager.updateServerVariables();
            }
        }
    }

    const tags = { module: "CRON", function: "EXECUTE" };
    try {
        await execute();
        Uptime.pingUptime("up", "OK", "CRON");
    } catch (e) {
        Logger.error({ tags, message: "Failed event handling: " + e });
        Uptime.pingUptime("down", e, "CRON");
    }
};

job.start();

const run = async () => {
    await EnvironmentManager.updateServerVariables();

    await executeCron();
    startEventListener();
};

await run();
