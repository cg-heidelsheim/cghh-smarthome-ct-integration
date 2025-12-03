const WebSocket = require('ws');
const {Uptime} = require('../uptime');
const {Logger} = require('./util/logger');
const {EnvironmentManager} = require("./util/environment-manager");

class WebsocketManager {
    websocket;
    pingIntervallMilliseconds = 10 * 1000; // 5s
    reconnectIntervallMillis = 10 * 1000; // 10s

    pingIntervalRef;
    reconnectIntervalRef;

    // connection information
    url;
    headers;

    constructor(url) {
        this.url = url;
    }

    setHeaders(headers) {
        this.headers = headers;
    }

    /**
     * Start websocket connection
     * Set default callback on message
     *
     * @param {*} callback  Callback to execute on message event
     */
    connect = async (callback) => {
        let tags = {module: "WS"};

        await EnvironmentManager.updateServerVariables();

        this.websocket = new WebSocket(process.env.HOMEMATIC_WS_URL, {
            headers: this.headers
        });

        this.websocket.on('message', (data) => {
            Uptime.pingUptime("up", "GOT MESSAGE", "WS");
            callback(data);
        });

        this.websocket.on('open', () => {
            Logger.info({tags, message: "Connected"});
            Uptime.pingUptime("up", "CONNECTED", "WS");
            this.initializePingInterval();
        });

        this.websocket.on('close', async () => {
            Logger.warn({tags, message: "Disconnected"});
            Uptime.pingUptime("down", "DISCONNECTED", "WS");
            this.clearPingInterval();
            this.initializeReconnectInterval(callback);
        });

        this.websocket.on('error', (error) => {
            Logger.warn({tags, message: error.message});
            Uptime.pingUptime("down", error.message, "WS");
            this.clearPingInterval();
            this.initializeReconnectInterval(callback);
        });

        this.websocket.on('unexpected-response', (error) => {
            Logger.warn({tags, message: error.message});
            Uptime.pingUptime("down", error.message, "WS");
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
                    if (this.websocket.readyState > 0) {
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
    initializeReconnectInterval = (callback) => {
        this.clearWsReconnectInterval();

        this.reconnectIntervalRef = setInterval(() => {
            this.connect(callback).then(_ => console.log("WS Connected 2"));
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

module.exports = {WebsocketManager};
