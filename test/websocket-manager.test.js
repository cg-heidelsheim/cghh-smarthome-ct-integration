jest.mock('ws', () => jest.fn());
jest.mock('../src/util/environment-manager', () => ({
  EnvironmentManager: { updateServerVariables: jest.fn().mockResolvedValue(undefined) },
}));

const WebSocket = require('ws');
const { WebsocketManager } = require('../src/websocket-manager');
const { Uptime } = require('../uptime');
const { EnvironmentManager } = require('../src/util/environment-manager');
const { Logger } = require('../src/util/logger');

function makeFakeSocket() {
  const handlers = {};
  const socket = {
    on: jest.fn((event, cb) => {
      handlers[event] = handlers[event] || [];
      handlers[event].push(cb);
      return socket;
    }),
    emit: (event, ...args) => (handlers[event] || []).forEach((cb) => cb(...args)),
    ping: jest.fn(),
    readyState: 1,
  };
  return socket;
}

describe('WebsocketManager reconnect behavior', () => {
  let instances;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    instances = [];
    WebSocket.mockImplementation(() => {
      const socket = makeFakeSocket();
      instances.push(socket);
      return socket;
    });
    jest.spyOn(Uptime, 'pingUptime').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens one WebSocket connection on connect()', async () => {
    const manager = new WebsocketManager('wss://example');
    await manager.connect(jest.fn());
    expect(instances).toHaveLength(1);
  });

  it('opens a second connection after the reconnect interval fires following a disconnect', async () => {
    const manager = new WebsocketManager('wss://example');
    await manager.connect(jest.fn());

    instances[0].emit('close');
    await jest.advanceTimersByTimeAsync(10_000);

    expect(instances).toHaveLength(2);
  });

  it("FIXED (was: KNOWN BUG): stops opening new connections once a reconnect succeeds, because the 'open' handler now clears the reconnect interval", async () => {
    const manager = new WebsocketManager('wss://example');
    await manager.connect(jest.fn());

    // simulate an outage -> starts a repeating reconnect interval
    instances[0].emit('close');
    await jest.advanceTimersByTimeAsync(10_000);
    expect(instances).toHaveLength(2);

    // the reconnection succeeds -> the reconnect interval must now be cleared
    instances[1].emit('open');

    await jest.advanceTimersByTimeAsync(10_000);
    await jest.advanceTimersByTimeAsync(10_000);

    expect(instances).toHaveLength(2);
  });

  it("FIXED: 'unexpected-response' logs the real HTTP status instead of always-undefined (ws's real signature is (request, response), not an Error)", async () => {
    const manager = new WebsocketManager('wss://example');
    await manager.connect(jest.fn());

    instances[0].emit('unexpected-response', {}, {statusCode: 401, statusMessage: 'Unauthorized'});

    const warnCall = Logger.warn.mock.calls.find(([arg]) => arg.message?.includes('Unexpected response'));
    expect(warnCall[0].message).toBe('Unexpected response: 401 Unauthorized');
    expect(Uptime.pingUptime).toHaveBeenCalledWith('down', 'Unexpected response: 401 Unauthorized', 'WS');
  });

  it('FIXED: a failed reconnect attempt is caught and logged, not left as an unhandled promise rejection', async () => {
    const manager = new WebsocketManager('wss://example');
    await manager.connect(jest.fn());

    instances[0].emit('close'); // starts the reconnect interval

    EnvironmentManager.updateServerVariables.mockRejectedValueOnce(new Error('lookup failed'));

    await jest.advanceTimersByTimeAsync(10_000);
    // flush the microtask queue so the rejected connect() promise's .catch() runs
    await Promise.resolve();
    await Promise.resolve();

    const warnCall = Logger.warn.mock.calls.find(([arg]) => arg.message?.includes('Reconnect attempt failed'));
    expect(warnCall[0].message).toBe('Reconnect attempt failed: lookup failed');
  });
});
