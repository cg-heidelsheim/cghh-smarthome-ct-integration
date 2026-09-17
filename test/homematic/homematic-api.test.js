jest.mock('axios');

const axios = require('axios');
const { HomematicApi } = require('../../src/homematic/homematic-api');
const { Logger } = require('../../src/util/logger');

describe('HomematicApi', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...ORIGINAL_ENV,
      HOMEMATIC_API_URL: 'https://api.example/',
      HOMEMATIC_API_AUTHTOKEN: 'token',
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('setTemperatureForGroup dry-run gate (safety-critical: must never hit the real API outside production)', () => {
    it.each([undefined, 'development', 'staging', 'Production', 'PRODUCTION', ''])(
      'does not call the real API when ENVIRONMENT=%p',
      async (envValue) => {
        if (envValue === undefined) {
          delete process.env.ENVIRONMENT;
        } else {
          process.env.ENVIRONMENT = envValue;
        }
        const api = new HomematicApi();
        await api.setTemperatureForGroup('group-1', 21);
        expect(axios.post).not.toHaveBeenCalled();
      }
    );

    it('calls the real API only when ENVIRONMENT is exactly "production"', async () => {
      process.env.ENVIRONMENT = 'production';
      axios.post.mockResolvedValue({ data: { ok: true } });

      const api = new HomematicApi();
      await api.setTemperatureForGroup('group-1', 21);

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.example/hmip/group/heating/setSetPointTemperature',
        { groupId: 'group-1', setPointTemperature: 21 },
        expect.anything()
      );
    });
  });

  describe('callRest retry behavior (fixed in Phase 2 — previously: broken backoff formula, attempt counter never advanced, retry chain never awaited by the caller)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('retries with bounded exponential backoff (5s, 10s, 20s, 40s, capped at 60s) and stops after maxRetries', async () => {
      axios.post.mockRejectedValue(new Error('network down'));
      const api = new HomematicApi();

      const callPromise = api.callRest('https://api.example/x', {a: 1});
      // Swallow the eventual rejection so it doesn't surface as an unhandled rejection
      // while we're still driving fake timers below.
      callPromise.catch(() => {});

      expect(axios.post).toHaveBeenCalledTimes(1);

      const expectedDelaysMs = [5000, 10000, 20000, 40000, 60000];
      for (const delay of expectedDelaysMs) {
        await jest.advanceTimersByTimeAsync(delay);
      }

      // 1 initial call + 5 retries = 6 total, then it gives up.
      expect(axios.post).toHaveBeenCalledTimes(6);
      await expect(callPromise).rejects.toThrow();

      const loggedAttempts = Logger.warn.mock.calls
          .map(([arg]) => arg?.tags?.attempt)
          .filter((a) => a !== undefined);
      // The counter now genuinely advances: attempts 1-5 each log once via the
      // "Could not execute/Retrying in" pair, plus the "Retrying request" pre-log for
      // attempts 2-6 — so every value 1..6 should appear at least once.
      expect(new Set(loggedAttempts)).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    });

    it('propagates the eventual failure to the original caller instead of resolving early as undefined', async () => {
      axios.post.mockRejectedValue(new Error('network down'));
      const api = new HomematicApi();

      const callPromise = api.callRest('https://api.example/x', {a: 1});
      const assertion = expect(callPromise).rejects.toThrow();

      for (let i = 0; i < 5; i++) {
        await jest.advanceTimersByTimeAsync(60000);
      }

      await assertion;
    });

    it('resolves with the response data once a retry succeeds', async () => {
      axios.post
          .mockRejectedValueOnce(new Error('network down'))
          .mockResolvedValueOnce({data: {ok: true}});
      const api = new HomematicApi();

      const callPromise = api.callRest('https://api.example/x', {a: 1});
      await jest.advanceTimersByTimeAsync(5000);

      await expect(callPromise).resolves.toEqual({ok: true});
      expect(axios.post).toHaveBeenCalledTimes(2);
    });

    it('throws immediately when the first synchronous call already starts above maxRetries', async () => {
      axios.post.mockRejectedValue(new Error('network down'));
      const api = new HomematicApi();

      await expect(api.callRest('https://api.example/x', {a: 1}, 6)).rejects.toThrow();
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });
});
