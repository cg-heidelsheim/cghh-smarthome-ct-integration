import moment from './timezone.bootstrap';
import influxDb from '../timeseries/influx/influx-db';

interface LogData {
    tags?: Record<string, unknown>;
    message: string;
}

export class Logger {

    static core(data: LogData, info: Record<string, unknown> = {}) {
        Logger.log('CORE', data.tags, data.message, info);
    }

    static trace(data: LogData, info: Record<string, unknown> = {}) {
        Logger.log('TRACE', data.tags, data.message, info);
    }

    static debug(data: LogData, info: Record<string, unknown> = {}) {
        Logger.log('DEBUG', data.tags, data.message, info);
    }

    static info(data: LogData, info: Record<string, unknown> = {}) {
        Logger.log('INFO', data.tags, data.message, info);
    }

    static warn(data: LogData, info: Record<string, unknown> = {}) {
        Logger.log('WARN', data.tags, data.message, info);
    }

    static error(data: LogData, info: Record<string, unknown> = {}) {
        Logger.log('ERROR', data.tags, data.message, info);
    }

    static log(level: string, tags: Record<string, unknown> | undefined, message: string, info: Record<string, unknown> = {}) {
        tags = tags || {};
        tags['level'] = level;

        console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [${tags.level}] ${JSON.stringify(tags)} ${message}`);

        tags = {level, ...tags};
        influxDb.sendLog({tags, message}, info);
    }
}
