const {renderLayout} = require('../../src/docs-site/layout');

const sections = [
    {
        slug: 'nutzer',
        title: 'Für Nutzer:innen',
        pages: [
            {slug: '', title: 'Übersicht', file: 'ignored.md'},
            {slug: 'faq', title: 'FAQ', file: 'ignored.md'},
        ],
    },
    {
        slug: 'technik',
        title: 'Für Entwickler:innen',
        pages: [
            {slug: '', title: 'Übersicht', file: 'ignored.md'},
        ],
    },
];

describe('renderLayout', () => {
    it('includes the page title and body content', () => {
        const html = renderLayout({
            sections,
            activeSectionSlug: 'nutzer',
            activePageSlug: 'faq',
            title: 'FAQ',
            bodyHtml: '<h1>FAQ</h1>',
        });

        expect(html).toContain('<title>FAQ - ChurchTools-Heizungsintegration</title>');
        expect(html).toContain('<h1>FAQ</h1>');
    });

    it('renders one nav link per page, using routeFor-style hrefs', () => {
        const html = renderLayout({
            sections,
            activeSectionSlug: 'nutzer',
            activePageSlug: '',
            title: 'Übersicht',
            bodyHtml: '',
        });

        expect(html).toContain('href="/docs/nutzer"');
        expect(html).toContain('href="/docs/nutzer/faq"');
        expect(html).toContain('href="/docs/technik"');
    });

    it('marks only the active page\'s nav link as active', () => {
        const html = renderLayout({
            sections,
            activeSectionSlug: 'nutzer',
            activePageSlug: 'faq',
            title: 'FAQ',
            bodyHtml: '',
        });

        expect(html).toMatch(/<a href="\/docs\/nutzer\/faq" class="active"[^>]*>FAQ<\/a>/);
        expect(html).not.toMatch(/<a href="\/docs\/nutzer" class="active"/);
    });

    it('escapes HTML in titles to avoid injecting markup from content', () => {
        const html = renderLayout({
            sections: [],
            activeSectionSlug: '',
            activePageSlug: '',
            title: '<script>alert(1)</script>',
            bodyHtml: '',
        });

        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).toContain('&lt;script&gt;');
    });
});
