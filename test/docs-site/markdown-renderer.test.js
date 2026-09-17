const {renderMarkdown, slugify} = require('../../src/docs-site/markdown-renderer');

describe('slugify', () => {
    it('lowercases and replaces spaces with hyphens', () => {
        expect(slugify('Grafana-Dashboards')).toBe('grafana-dashboards');
    });

    it('transliterates German umlauts and ß', () => {
        expect(slugify('Für Entwickler:innen äöüß')).toBe('fuer-entwicklerinnen-aeoeuess');
    });

    it('matches the anchor used by docs/site/technik/komponenten.md', () => {
        expect(slugify('HomematicIP-Token erzeugen')).toBe('homematicip-token-erzeugen');
    });
});

describe('renderMarkdown', () => {
    it('renders a heading with a matching id attribute', () => {
        const html = renderMarkdown('# Heizungslogik\n\nSome text.');

        expect(html).toContain('<h1 id="heizungslogik">Heizungslogik</h1>');
        expect(html).toContain('<p>Some text.</p>');
    });

    it('renders fenced code blocks', () => {
        const html = renderMarkdown('```js\nconst x = 1;\n```');

        expect(html).toContain('<pre>');
        expect(html).toContain('const x = 1;');
    });

    it('renders GFM tables', () => {
        const html = renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |');

        expect(html).toContain('<table>');
        expect(html).toContain('<td>1</td>');
    });

    it('renders links as-is (absolute site paths used throughout docs/site/)', () => {
        const html = renderMarkdown('[Heizungslogik](/docs/nutzer/heizungslogik)');

        expect(html).toContain('<a href="/docs/nutzer/heizungslogik">Heizungslogik</a>');
    });
});
