'use strict';

require('dotenv').config();
const axios = require('axios');
const {Event} = require('./model/event');

class ChurchToolsApiClient {
    constructor() {
        this.baseUrl = process.env.CT_API_URL;
        if (!this.baseUrl) throw new Error('CT_API_URL environment variable is not set.');
        this.cookietoken = "";
    }

    async login() {
        try {
            const response = await axios.post(`${this.baseUrl}/api/login`, {
                username: process.env.CT_USERNAME, password: process.env.CT_PASSWORD,
            }, {withCredentials: true});

            this.cookietoken = response.headers["set-cookie"] ? response.headers["set-cookie"][0].split(";")[0].split("=")[1] : "";

            const data = response.data;

            if (data && data.data.status !== "success") {
                throw new Error("Login failed: " + JSON.stringify(data));
            }
        } catch (error) {
            throw new Error("Login Error: " + error.message);
        }
    }

    async getEvents() {
        await this.login();

        let url = `${this.baseUrl}/index.php?q=churchcal/ajax&func=getCalendarEvents&from=-1&to=1`;
        const categoryIds = (process.env.CALENDAR_CATEGORIES || "").split(",");
        categoryIds.forEach((id) => {
            url += `&category_ids[]=${id}`;
        });

        try {
            const response = await axios.get(url, {
                withCredentials: true,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    cookie: "ChurchTools_ct_heidelsheim=" + this.cookietoken,
                },
            });

            if (response.data.status === "error") {
                throw new Error(JSON.stringify(response.data));
            }

            const rawEvents = response.data.data || [];
            return rawEvents.map((ev) => Event.fromJSON(ev));
        } catch (error) {
            throw new Error("Error fetching events: " + error);
        }
    }
}

module.exports = ChurchToolsApiClient;
