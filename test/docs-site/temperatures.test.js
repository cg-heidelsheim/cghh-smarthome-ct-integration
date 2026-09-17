const fs = require('fs');

const {renderTemperaturesBody} = require('../../src/docs-site/temperatures');

describe('renderTemperaturesBody', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders both config files when present, sorted by name', () => {
        jest.spyOn(fs, 'readFileSync').mockImplementation((file) => {
            if (file.toString().endsWith('room.config.json')) {
                return JSON.stringify({
                    b: {name: 'Zebra-Raum', desiredTemperature: 19, desiredTemperatureIdle: 16},
                    a: {name: 'Amsel-Raum', desiredTemperature: 20, desiredTemperatureIdle: 15},
                });
            }
            return JSON.stringify({
                Gottesdienst: {id: 'Gottesdienst', desiredTemperature: 18, comment: 'immer 18'},
            });
        });

        const html = renderTemperaturesBody();

        expect(html).toContain('Amsel-Raum');
        expect(html.indexOf('Amsel-Raum')).toBeLessThan(html.indexOf('Zebra-Raum'));
        expect(html).toContain('Gottesdienst');
        expect(html).toContain('immer 18');
    });

    it('shows a friendly notice instead of crashing when a config file is missing', () => {
        jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            throw new Error('ENOENT');
        });

        const html = renderTemperaturesBody();

        expect(html).toContain('config/room.config.json');
        expect(html).toContain('config/event-room-temperature.config.json');
        expect(html).toContain('callout');
    });

    it('shows a placeholder when there are no event-level overrides configured', () => {
        jest.spyOn(fs, 'readFileSync').mockImplementation((file) => {
            if (file.toString().endsWith('room.config.json')) {
                return JSON.stringify({a: {name: 'Saal', desiredTemperature: 19, desiredTemperatureIdle: 16}});
            }
            return JSON.stringify({});
        });

        const html = renderTemperaturesBody();

        expect(html).toContain('Aktuell sind keine abweichenden Termin-Zieltemperaturen hinterlegt');
    });
});
