jest.mock('../../src/homematic/homematic-api');

const {EnvironmentManager} = require('../../src/util/environment-manager');
const {HomematicApi} = require('../../src/homematic/homematic-api');
const {Logger} = require('../../src/util/logger');

describe('EnvironmentManager.updateServerVariables', () => {
    let getServerUrls;

    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.HOMEMATIC_API_URL;
        delete process.env.HOMEMATIC_WS_URL;
        getServerUrls = jest.fn();
        HomematicApi.mockImplementation(() => ({getServerUrls}));
    });

    it('sets HOMEMATIC_API_URL and HOMEMATIC_WS_URL from the lookup response', async () => {
        getServerUrls.mockResolvedValue({
            urlREST: 'https://rest.example.com',
            urlWebSocket: 'wss://ws.example.com',
        });

        await EnvironmentManager.updateServerVariables();

        expect(process.env.HOMEMATIC_API_URL).toBe('https://rest.example.com/');
        expect(process.env.HOMEMATIC_WS_URL).toBe('wss://ws.example.com/');
    });

    it('does not log/warn when the URLs are unchanged from the current env', async () => {
        process.env.HOMEMATIC_API_URL = 'https://rest.example.com/';
        process.env.HOMEMATIC_WS_URL = 'wss://ws.example.com/';
        getServerUrls.mockResolvedValue({
            urlREST: 'https://rest.example.com',
            urlWebSocket: 'wss://ws.example.com',
        });

        await EnvironmentManager.updateServerVariables();

        expect(Logger.warn).not.toHaveBeenCalled();
    });

    // Characterization: src/util/environment-manager.js:15's
    // `await homematicAPI.getServerUrls()` sits OUTSIDE the try block (which starts
    // at line 17 and only guards the response-processing code below it). So a
    // rejection from getServerUrls() itself is NOT caught here — it propagates out
    // of updateServerVariables() uncaught. This differs from the architecture
    // report's assumption that all failures are swallowed; only failures in
    // processing an already-received response are swallowed.
    it('propagates (does not swallow) a rejection from getServerUrls() itself', async () => {
        getServerUrls.mockRejectedValue(new Error('network down'));

        await expect(EnvironmentManager.updateServerVariables()).rejects.toThrow('network down');
    });

    // Characterization: if getServerUrls() resolves but the response shape is
    // unusable (e.g. missing urlREST), the try/catch around the *processing* code
    // does swallow that failure, and leaves process.env untouched (the throw at
    // line 40 is commented out in the real source).
    it('swallows a malformed response and leaves process.env untouched', async () => {
        process.env.HOMEMATIC_API_URL = 'https://old.example.com/';
        getServerUrls.mockResolvedValue(null); // response["urlREST"] on null throws

        await expect(EnvironmentManager.updateServerVariables()).resolves.toBeUndefined();
        expect(process.env.HOMEMATIC_API_URL).toBe('https://old.example.com/');
        expect(Logger.error).toHaveBeenCalledTimes(1);
    });
});
