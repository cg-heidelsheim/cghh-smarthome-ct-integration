jest.mock('axios');
const axios = require('axios');
const ChurchToolsApiClient = require('../../src/churchtools/ct-api');

describe('ChurchToolsApiClient', () => {
  const originalEnv = {...process.env};

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CT_API_URL = 'https://example.invalid';
    process.env.CT_USERNAME = 'user';
    process.env.CT_PASSWORD = 'pass';
    process.env.CALENDAR_CATEGORIES = '1,2';
  });

  afterEach(() => {
    process.env = {...originalEnv};
  });

  it('throws if CT_API_URL is not set', () => {
    delete process.env.CT_API_URL;
    expect(() => new ChurchToolsApiClient()).toThrow('CT_API_URL environment variable is not set.');
  });

  describe('login', () => {
    it('extracts the cookie token from the set-cookie header on success', async () => {
      axios.post.mockResolvedValue({
        headers: {'set-cookie': ['ChurchTools_ct_heidelsheim=abc123; Path=/']},
        data: {data: {status: 'success'}},
      });
      const client = new ChurchToolsApiClient();

      await client.login();

      expect(client.cookietoken).toBe('abc123');
      expect(axios.post).toHaveBeenCalledWith(
          'https://example.invalid/api/login',
          {username: 'user', password: 'pass'},
          {withCredentials: true},
      );
    });

    it('defaults the cookie token to empty string when no set-cookie header is present', async () => {
      axios.post.mockResolvedValue({headers: {}, data: {data: {status: 'success'}}});
      const client = new ChurchToolsApiClient();

      await client.login();

      expect(client.cookietoken).toBe('');
    });

    it('wraps a non-"success" status into a thrown "Login failed" error', async () => {
      axios.post.mockResolvedValue({headers: {}, data: {data: {status: 'error'}}});
      const client = new ChurchToolsApiClient();

      await expect(client.login()).rejects.toThrow(/Login Error:.*Login failed/);
    });

    it('wraps a rejected request into a "Login Error"', async () => {
      axios.post.mockRejectedValue(new Error('ECONNREFUSED'));
      const client = new ChurchToolsApiClient();

      await expect(client.login()).rejects.toThrow('Login Error: ECONNREFUSED');
    });
  });

  describe('getEvents', () => {
    function setup() {
      const client = new ChurchToolsApiClient();
      client.login = jest.fn().mockResolvedValue(undefined);
      client.cookietoken = 'abc123';
      return client;
    }

    it('logs in first, then builds the calendar URL with each configured category id', async () => {
      axios.get.mockResolvedValue({data: {status: 'ok', data: []}});
      const client = setup();

      await client.getEvents();

      expect(client.login).toHaveBeenCalled();
      const [url, opts] = axios.get.mock.calls[0];
      expect(url).toContain('func=getCalendarEvents');
      expect(url).toContain('category_ids[]=1');
      expect(url).toContain('category_ids[]=2');
      expect(opts.headers.cookie).toBe('ChurchTools_ct_heidelsheim=abc123');
    });

    it('maps raw event JSON into Event instances via Event.fromJSON', async () => {
      axios.get.mockResolvedValue({
        data: {
          status: 'ok',
          data: [
            {startdate: '2024-01-01 10:00:00', enddate: '2024-01-01 12:00:00', bezeichnung: 'Gottesdienst', category_id: '1', category_name: 'Cat'},
          ],
        },
      });
      const client = setup();

      const events = await client.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].name).toBe('Gottesdienst');
      expect(events[0].startDate).toBe('2024-01-01 10:00:00');
    });

    it('returns an empty array when the API responds with no data field', async () => {
      axios.get.mockResolvedValue({data: {status: 'ok'}});
      const client = setup();

      const events = await client.getEvents();

      expect(events).toEqual([]);
    });

    it('throws when the API responds with status "error"', async () => {
      axios.get.mockResolvedValue({data: {status: 'error', message: 'nope'}});
      const client = setup();

      await expect(client.getEvents()).rejects.toThrow('Error fetching events:');
    });

    it('wraps a rejected request into an "Error fetching events"', async () => {
      axios.get.mockRejectedValue(new Error('timeout'));
      const client = setup();

      await expect(client.getEvents()).rejects.toThrow('Error fetching events: Error: timeout');
    });
  });
});
