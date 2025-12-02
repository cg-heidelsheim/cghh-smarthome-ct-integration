/**
 * TODO: find out what fields the HMIP sends for a home on a WebSocket message. Update this class respectively
 */
class Home {

    data;

    constructor(data) {
        this.data = data;
    }
}

module.exports = { Home };