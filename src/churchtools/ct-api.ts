import axios from 'axios';
import {Event} from './model/event';

require('dotenv').config();

class ChurchToolsApiClient {
    baseUrl: string;
    cookieName: string;
    cookieValue: string;

    constructor() {
        this.baseUrl = process.env.CT_API_URL ?? '';
        if (!this.baseUrl) {throw new Error('CT_API_URL environment variable is not set.');}
        this.cookieName = '';
        this.cookieValue = '';
    }

    async login(): Promise<void> {
        try {
            const response = await axios.post(`${this.baseUrl}/api/login`, {
                username: process.env.CT_USERNAME, password: process.env.CT_PASSWORD,
            }, {withCredentials: true});

            // FIXED: previously always took set-cookie[0] and always sent it back under the
            // hardcoded name 'ChurchTools_ct_heidelsheim'. ChurchTools now sends that same
            // cookie name twice, first as an *expired, empty-value* cookie clearing the old
            // session, before the real one - under a different name,
            // 'ChurchToolsV2_ct_heidelsheim'. Reading index [0] silently picked up the empty
            // clearing cookie, so every request after login ran unauthenticated: ChurchTools
            // doesn't reply with an HTTP 401 for that, it replies 200 with a JSON body
            // ({status: "fail", data: "<permission error string>"}), which the checks below
            // didn't catch either, so it surfaced three steps downstream as an unrelated
            // "rawEvents.map is not a function" crash. This is the actual pre-existing bug
            // behind that error, not a local `.env`/test-credentials issue. Now picks
            // whichever set-cookie entry actually has a non-empty value, and sends that
            // cookie back under its own real name - robust to ChurchTools renaming it again.
            const setCookie = response.headers['set-cookie'] ?? [];
            const sessionCookie = setCookie
                .map((raw) => raw.split(';')[0])
                .map((pair) => {
                    const eq = pair.indexOf('=');
                    return {name: pair.slice(0, eq), value: pair.slice(eq + 1)};
                })
                .find((cookie) => cookie.value.length > 0);
            this.cookieName = sessionCookie?.name ?? '';
            this.cookieValue = sessionCookie?.value ?? '';

            const data = response.data;

            if (data && data.data.status !== 'success') {
                throw new Error('Login failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            throw new Error('Login Error: ' + error.message);
        }
    }

    async getEvents(): Promise<Event[]> {
        await this.login();

        let url = `${this.baseUrl}/index.php?q=churchcal/ajax&func=getCalendarEvents&from=-1&to=1`;
        const categoryIds = (process.env.CALENDAR_CATEGORIES || '').split(',');
        categoryIds.forEach((id) => {
            url += `&category_ids[]=${id}`;
        });

        try {
            const response = await axios.get(url, {
                withCredentials: true,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    cookie: `${this.cookieName}=${this.cookieValue}`,
                },
            });

            // FIXED: only checked for status === 'error'. An unauthenticated/unauthorized
            // request (e.g. the stale-cookie bug above) comes back as status === 'fail' with
            // a message in `data`, not 'error' - that case fell all the way through to
            // `rawEvents.map()` on a non-array `data` value instead of a clear error here.
            if (response.data.status !== 'success') {
                throw new Error(JSON.stringify(response.data));
            }

            const rawEvents = response.data.data || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw external API payload
            return rawEvents.map((ev: any) => Event.fromJSON(ev));
        } catch (error) {
            throw new Error('Error fetching events: ' + error);
        }
    }
}

export = ChurchToolsApiClient;
