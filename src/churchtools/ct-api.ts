import axios from 'axios';
import {Event} from './model/event';

require('dotenv').config();

class ChurchToolsApiClient {
    baseUrl: string;
    cookietoken: string;

    constructor() {
        this.baseUrl = process.env.CT_API_URL ?? '';
        if (!this.baseUrl) {throw new Error('CT_API_URL environment variable is not set.');}
        this.cookietoken = '';
    }

    async login(): Promise<void> {
        try {
            const response = await axios.post(`${this.baseUrl}/api/login`, {
                username: process.env.CT_USERNAME, password: process.env.CT_PASSWORD,
            }, {withCredentials: true});

            const setCookie = response.headers['set-cookie'];
            this.cookietoken = setCookie ? setCookie[0].split(';')[0].split('=')[1] : '';

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
                    cookie: 'ChurchTools_ct_heidelsheim=' + this.cookietoken,
                },
            });

            if (response.data.status === 'error') {
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
