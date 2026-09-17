import {marked, type Renderer, type Tokens} from 'marked';

// GitHub-style heading slugs (lowercase, spaces/umlauts normalized to '-'/ascii), so that
// intra-site links like `/docs/technik/komponenten#homematicip-token-erzeugen` (see
// docs/site/technik/komponenten.md) actually land on the right heading. `marked` does not add
// heading `id`s on its own.
export const slugify = (text: string): string =>
    text
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

marked.use({
    renderer: {
        heading(this: Renderer, token: Tokens.Heading): string {
            const id = slugify(token.text);
            const inner = this.parser.parseInline(token.tokens);
            return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
        },
    },
});

/** Pure Markdown -> HTML-fragment conversion. No I/O, no layout - see layout.ts for the page shell. */
export const renderMarkdown = (markdown: string): string => marked.parse(markdown, {async: false});
