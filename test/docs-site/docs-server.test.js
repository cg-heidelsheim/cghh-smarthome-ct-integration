const http = require('http');
const fs = require('fs');
const path = require('path');

const {startDocsServer} = require('../../src/docs-site/docs-server');

const request = (port, reqPath) => new Promise((resolve, reject) => {
    http.get({port, path: reqPath}, (res) => {
        const chunks = [];
        res.on('data', (chunk) => {chunks.push(chunk);});
        res.on('end', () => resolve({statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(chunks)}));
    }).on('error', reject);
});

describe('docs server', () => {
    let server;
    let port;

    beforeAll((done) => {
        server = startDocsServer(0);
        server.on('listening', () => {
            port = server.address().port;
            done();
        });
    });

    afterAll((done) => {
        server.close(done);
    });

    it('redirects / to the user-facing docs section', async () => {
        const res = await request(port, '/');

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/docs/nutzer');
    });

    it('redirects /docs to the user-facing docs section', async () => {
        const res = await request(port, '/docs');

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/docs/nutzer');
    });

    it('serves the rendered German heating-logic page', async () => {
        const res = await request(port, '/docs/nutzer/heizungslogik');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('text/html');
        expect(res.body.toString()).toContain('Heizungslogik');
        expect(res.body.toString()).toContain('benötigte Zeit');
    });

    it('serves the rendered German developer overview page', async () => {
        const res = await request(port, '/docs/technik/komponenten');

        expect(res.statusCode).toBe(200);
        expect(res.body.toString()).toContain('Komponenten');
    });

    it('serves the Hausverwaltung section, kept separate from the general Nutzer docs', async () => {
        const res = await request(port, '/docs/hausverwaltung/grafana');

        expect(res.statusCode).toBe(200);
        expect(res.body.toString()).toContain('Grafana-Dashboards');
    });

    it('no longer serves an internal mirror of README/AGENTS/architecture (removed - external GitHub links only)', async () => {
        const res = await request(port, '/docs/referenz/readme');

        expect(res.statusCode).toBe(404);
    });

    it('renders the Zieltemperaturen page live from the real config files on every request', async () => {
        const res = await request(port, '/docs/nutzer/zieltemperaturen');

        expect(res.statusCode).toBe(200);
        const body = res.body.toString();
        expect(body).toContain('Zieltemperaturen');
        // Sanity-checks against the actual (committed) config/room.config.json content, proving
        // this is read live rather than pre-baked into a static page.
        expect(body).toContain('Godi-Saal');
        expect(body).toContain('Gottesdienst');
    });

    it('serves the favicon as a real image, not wrapped in the HTML layout', async () => {
        const res = await request(port, '/docs/assets/favicon.png');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toBe('image/png');
        const expected = fs.readFileSync(path.join(process.cwd(), 'docs/site/assets/favicon.png'));
        expect(res.body.equals(expected)).toBe(true);
    });

    it('tolerates a trailing slash on a page route', async () => {
        const res = await request(port, '/docs/nutzer/');

        expect(res.statusCode).toBe(200);
        expect(res.body.toString()).toContain('Willkommen');
    });

    it('returns a 404 page for an unknown path', async () => {
        const res = await request(port, '/does-not-exist');

        expect(res.statusCode).toBe(404);
        expect(res.body.toString()).toContain('Seite nicht gefunden');
    });
});
