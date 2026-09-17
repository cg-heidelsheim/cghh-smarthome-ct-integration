import WebSocket from 'ws';
import {Uptime} from '../uptime';
import {Logger} from './util/logger';
import {EnvironmentManager} from './util/environment-manager';

type WsMessageCallback = (data: WebSocket.RawData) => void;

export class WebsocketManager {
    websocket?: WebSocket;
    pingIntervallMilliseconds = 10 * 1000; // 5s
    reconnectIntervallMillis = 10 * 1000; // 10s

    pingIntervalRef?: NodeJS.Timeout;
    reconnectIntervalRef?: NodeJS.Timeout;

    // connection information
    url: string;
    headers?: Record<string, string>;

    constructor(url: string) {
        this.url = url;
    }

    setHeaders(headers: Record<string, string>) {
        this.headers = headers;
    }

    /**
     * Start websocket connection
     * Set default callback on message
     */
    connect = async (callback: WsMessageCallback) => {
        const tags = {module: 'WS'};

        await EnvironmentManager.updateServerVariables();

        this.websocket = new WebSocket(process.env.HOMEMATIC_WS_URL!, {
            headers: this.headers
        });

        this.websocket.on('message', (data) => {
            // On non prod mode, wait for 1s before WS process.
            // This is bcs the prod change might cause a ws event BEFORE the test/feature even finished the automatic action itself.
            if (process.env.ENVIRONMENT !== 'production') {
                setTimeout(() => {
                    Uptime.pingUptime('up', 'GOT MESSAGE', 'WS');
                    callback(data);
                }, 2000);
            } else {
                Uptime.pingUptime('up', 'GOT MESSAGE', 'WS');
                callback(data);
            }
        });

        this.websocket.on('open', () => {
            Logger.info({tags, message: 'Connected'});
            Uptime.pingUptime('up', 'CONNECTED', 'WS');
            // A successful (re)connect must stop any reconnect interval that was scheduled
            // while disconnected — previously missing, which meant one repeating interval
            // kept opening a new WebSocket connection every reconnectIntervallMillis
            // indefinitely, even after the connection had already recovered.
            this.clearWsReconnectInterval();
            this.initializePingInterval();
        });

        // `async` here was vestigial (nothing inside ever awaited) and, per
        // @typescript-eslint/no-misused-promises, actively risky: the `ws` event emitter
        // doesn't await/catch its listeners, so an async listener that later threw would
        // become an unhandled promise rejection.
        this.websocket.on('close', () => {
            Logger.warn({tags, message: 'Disconnected'});
            Uptime.pingUptime('down', 'DISCONNECTED', 'WS');
            this.clearPingInterval();
            this.initializeReconnectInterval(callback);
        });

        this.websocket.on('error', (error) => {
            Logger.warn({tags, message: error.message});
            Uptime.pingUptime('down', error.message, 'WS');
            this.clearPingInterval();
            this.initializeReconnectInterval(callback);
        });

        this.websocket.on('unexpected-response', (_request, response) => {
            // FIXED: previously typed (and called) as if this event passed an Error with a
            // `.message`, but the real `ws` library signature is (request, response) - no
            // "error" object at all - so `.message` was always undefined here. Using the
            // HTTP status line instead actually surfaces why the WS upgrade failed.
            const message = `Unexpected response: ${response.statusCode} ${response.statusMessage ?? ''}`.trim();
            Logger.warn({tags, message});
            Uptime.pingUptime('down', message, 'WS');
            this.clearPingInterval();
            this.initializeReconnectInterval(callback);
        });
    };

    /**
     * Set new ping interval.
     * Interval causes use of connection every {@link pingIntervallMilliseconds} milliseconds.
     * Always check if connection is still valid.
     */
    initializePingInterval = () => {
        this.clearPingInterval();

        if (this.websocket) {
            this.pingIntervalRef = setInterval(
                () => {
                    if (this.websocket && this.websocket.readyState > 0) {
                        this.websocket.ping();
                    }
                }, this.pingIntervallMilliseconds);
        }
    };

    /**
     * Set new reconnect interval.
     * Interval causes reconnect to server every {@link reconnectIntervallMillis} milliseconds, if the connection broke down for some reason.
     * Always check if connection is still valid.
     */
    initializeReconnectInterval = (callback: WsMessageCallback) => {
        this.clearWsReconnectInterval();

        this.reconnectIntervalRef = setInterval(() => {
            // FIXED: previously a floating promise with no rejection handler - if a
            // reconnect attempt threw (e.g. EnvironmentManager.updateServerVariables()
            // failing), it became an unhandled promise rejection on the live WS path,
            // which can crash the whole process depending on the Node unhandledRejection
            // policy. Caught and logged instead; the interval itself keeps retrying either way.
            this.connect(callback)
                .then(_ => console.log('WS Connected 2'))
                .catch((error) => Logger.warn({tags: {module: 'WS'}, message: 'Reconnect attempt failed: ' + error.message}));
        }, this.reconnectIntervallMillis);
    };

    /**
     * Clear current ping interval if exists
     */
    clearPingInterval = () => {
        if (this.pingIntervalRef) {
            clearInterval(this.pingIntervalRef);
        }
    };

    /**
     * Clear current reconnect interval if exists
     */
    clearWsReconnectInterval = () => {
        if (this.reconnectIntervalRef) {
            clearInterval(this.reconnectIntervalRef);
        }
    };
}
