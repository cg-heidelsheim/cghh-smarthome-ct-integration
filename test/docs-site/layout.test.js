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

    it('includes a mobile menu toggle button that expands the nav links', () => {
        const html = renderLayout({
            sections, activeSectionSlug: 'nutzer', activePageSlug: 'faq', title: 'FAQ', bodyHtml: '',
        });

        expect(html).toContain('id="nav-toggle"');
        expect(html).toContain('id="nav-links"');
        expect(html).toContain("classList.toggle('nav-expanded'");
    });

    it('includes a theme toggle button and its script', () => {
        const html = renderLayout({
            sections, activeSectionSlug: 'nutzer', activePageSlug: 'faq', title: 'FAQ', bodyHtml: '',
        });

        expect(html).toContain('id="theme-toggle"');
        expect(html).toContain('localStorage.setItem(KEY, next)');
    });

    it('only pulls in mermaid when the page body actually contains a diagram', () => {
        const withDiagram = renderLayout({
            sections, activeSectionSlug: 'technik', activePageSlug: '', title: 'X', bodyHtml: '<div class="mermaid">flowchart TD</div>',
        });
        const withoutDiagram = renderLayout({
            sections, activeSectionSlug: 'technik', activePageSlug: '', title: 'X', bodyHtml: '<p>no diagram here</p>',
        });

        expect(withDiagram).toContain('mermaid@10');
        expect(withoutDiagram).not.toContain('mermaid@10');
    });
});
