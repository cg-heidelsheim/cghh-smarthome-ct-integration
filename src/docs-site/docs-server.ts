import * as http from 'http';
import * as fs from 'fs';

import {routeFor, sections} from './content-manifest';
import {renderMarkdown} from './markdown-renderer';
import {renderLayout} from './layout';
import {Logger} from '../util/logger';

const DEFAULT_REDIRECT_TARGET = '/docs/nutzer';

const normalizePath = (url: string | undefined): string => {
    const withoutQuery = (url ?? '/').split('?')[0].split('#')[0];
    const withoutTrailingSlash = withoutQuery.replace(/\/+$/, '');
    return withoutTrailingSlash === '' ? '/' : withoutTrailingSlash;
};

const buildPages = (): Map<string, string> => {
    const pages = new Map<string, string>();

    for (const section of sections) {
        for (const page of section.pages) {
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

const buildNotFoundPage = (): string => renderLayout({
    sections,
    activeSectionSlug: '',
    activePageSlug: '',
    title: 'Seite nicht gefunden',
    bodyHtml: '<h1>Seite nicht gefunden</h1><p>Diese Seite existiert nicht (mehr). Bitte über die Navigation links weitersuchen.</p>',
});

/**
 * Serves the rendered documentation site. Content is read from disk and rendered once at
 * construction (docs only change on redeploy) and served straight from memory afterwards.
 */
export const startDocsServer = (port: number): http.Server => {
    const pages = buildPages();
    const notFoundPage = buildNotFoundPage();

    const server = http.createServer((req, res) => {
        const path = normalizePath(req.url);

        if (path === '/' || path === '/docs') {
            res.writeHead(302, {Location: DEFAULT_REDIRECT_TARGET});
            res.end();
            return;
        }

        const page = pages.get(path);
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
