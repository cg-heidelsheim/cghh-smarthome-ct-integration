import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

import {routeFor, sections} from './content-manifest';
import {renderMarkdown} from './markdown-renderer';
import {renderLayout} from './layout';
import {renderTemperaturesBody} from './temperatures';
import {Logger} from '../util/logger';

const DEFAULT_REDIRECT_TARGET = '/docs/nutzer';
const FAVICON_PATH = '/docs/assets/favicon.png';

const normalizePath = (url: string | undefined): string => {
    const withoutQuery = (url ?? '/').split('?')[0].split('#')[0];
    const withoutTrailingSlash = withoutQuery.replace(/\/+$/, '');
    return withoutTrailingSlash === '' ? '/' : withoutTrailingSlash;
};

const buildPages = (): Map<string, string> => {
    const pages = new Map<string, string>();

    for (const section of sections) {
        for (const page of section.pages) {
            if (!page.file) {continue;} // dynamic page - rendered per-request, see buildDynamicRoutes()

            const markdown = fs.readFileSync(page.file, 'utf-8');
            const html = renderLayout({
                sections,
                activeSectionSlug: section.slug,
                activePageSlug: page.slug,
                title: page.title,
                bodyHtml: renderMarkdown(markdown),
            });
            pages.set(routeFor(section, page), html);
        }
    }

    return pages;
};

/**
 * Routes rendered fresh on every request rather than once at startup - currently just
 * "Zieltemperaturen", which reflects config/*.json as it is on disk right now (see
 * temperatures.ts), not as it was when the process started.
 */
const buildDynamicRoutes = (): Map<string, () => string> => {
    const routes = new Map<string, () => string>();

    for (const section of sections) {
        for (const page of section.pages) {
            if (page.file) {continue;}
            if (page.slug === 'zieltemperaturen') {
                routes.set(routeFor(section, page), () => renderLayout({
                    sections,
                    activeSectionSlug: section.slug,
                    activePageSlug: page.slug,
                    title: page.title,
                    bodyHtml: renderTemperaturesBody(),
                }));
            }
        }
    }

    return routes;
};

const buildNotFoundPage = (): string => renderLayout({
    sections,
    activeSectionSlug: '',
    activePageSlug: '',
    title: 'Seite nicht gefunden',
    bodyHtml: '<h1>Seite nicht gefunden</h1><p>Diese Seite existiert nicht (mehr). Bitte über die Navigation links weitersuchen.</p>',
});

/**
 * Serves the rendered documentation site. Markdown content is read from disk and rendered once
 * at construction (docs only change on redeploy) and served straight from memory afterwards;
 * see buildDynamicRoutes() for the one page that's re-rendered per request instead.
 */
export const startDocsServer = (port: number): http.Server => {
    const pages = buildPages();
    const dynamicRoutes = buildDynamicRoutes();
    const notFoundPage = buildNotFoundPage();
    const favicon = fs.readFileSync(path.join(process.cwd(), 'docs/site/assets/favicon.png'));

    const server = http.createServer((req, res) => {
        const reqPath = normalizePath(req.url);

        if (reqPath === '/' || reqPath === '/docs') {
            res.writeHead(302, {Location: DEFAULT_REDIRECT_TARGET});
            res.end();
            return;
        }

        if (reqPath === FAVICON_PATH) {
            res.writeHead(200, {'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400'});
            res.end(favicon);
            return;
        }

        const dynamicRoute = dynamicRoutes.get(reqPath);
        if (dynamicRoute) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(dynamicRoute());
            return;
        }

        const page = pages.get(reqPath);
        if (page) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(page);
            return;
        }

        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(notFoundPage);
    });

    server.listen(port, () => {
        Logger.info({tags: {module: 'DOCS', function: 'START'}, message: `Docs server listening on port ${port}`});
    });

    return server;
};
