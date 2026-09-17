const http = require('http');

const {startDocsServer} = require('../../src/docs-site/docs-server');

const request = (port, path) => new Promise((resolve, reject) => {
    http.get({port, path}, (res) => {
        let body = '';
        res.on('data', (chunk) => {body += chunk;});
        res.on('end', () => resolve({statusCode: res.statusCode, headers: res.headers, body}));
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
        expect(res.body).toContain('Heizungslogik');
        expect(res.body).toContain('benötigte Zeit');
    });

    it('serves the rendered German developer overview page', async () => {
        const res = await request(port, '/docs/technik/komponenten');

        expect(res.statusCode).toBe(200);
        expect(res.body).toContain('Komponenten');
    });

    it('serves the English reference pages (README etc.) unmodified in content, wrapped in the same layout', async () => {
        const res = await request(port, '/docs/referenz/readme');

        expect(res.statusCode).toBe(200);
        expect(res.body).toContain('ChurchTools Integration for Homematic IP');
    });

    it('tolerates a trailing slash on a page route', async () => {
        const res = await request(port, '/docs/nutzer/');

        expect(res.statusCode).toBe(200);
        expect(res.body).toContain('Willkommen');
    });

    it('returns a 404 page for an unknown path', async () => {
        const res = await request(port, '/does-not-exist');

        expect(res.statusCode).toBe(404);
        expect(res.body).toContain('Seite nicht gefunden');
    });
});
