import {marked, type Renderer, type Tokens} from 'marked';

// GitHub-style heading slugs (lowercase, spaces/umlauts normalized to '-'/ascii), so that
// intra-site links like `/docs/technik/entwicklung#homematicip-token-erzeugen` (see
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

// A heading gets a stable id (for anchors) and, on h2/h3, a hover-only "#" self-link - cheap
// deep-linking without a client-side TOC library. h1 is the page title and is never linked to
// from elsewhere, so it's left plain.
const renderer = {
    heading(this: Renderer, token: Tokens.Heading): string {
        const id = slugify(token.text);
        const inner = this.parser.parseInline(token.tokens);
        const anchor = token.depth > 1 ? ` <a class="heading-anchor" href="#${id}" aria-label="Link zu diesem Abschnitt">#</a>` : '';
        return `<h${token.depth} id="${id}">${inner}${anchor}</h${token.depth}>\n`;
    },
};

marked.use({renderer});

const CALLOUT_LABELS: Record<string, string> = {
    note: 'ℹ️ Hinweis',
    tip: '💡 Tipp',
    important: '❗ Wichtig',
    warning: '⚠️ Achtung',
    caution: '🛑 Vorsicht',
    kontakt: '📞 Kontakt',
};

// GitHub-style alert syntax (`> [!WARNING]` etc., plus a project-specific `[!KONTAKT]`), e.g.:
//   > [!WARNING]
//   > Do the thing.
// is rewritten into a styled `<div class="callout callout-warning">` *before* the main
// marked.parse() pass, with its own nested marked.parse() call so bold/links/etc. inside the
// callout still render normally (a raw HTML block's content is otherwise left untouched by
// marked/CommonMark, so this can't be done via the block itself).
const CALLOUT_PATTERN = /^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|KONTAKT)\]\s*\n((?:>.*\n?)*)/gmi;

const renderCallouts = (markdown: string): string => markdown.replace(CALLOUT_PATTERN, (_match, type: string, quotedBody: string) => {
    const type_ = type.toLowerCase();
    const inner = quotedBody
        .split('\n')
        .map((line) => line.replace(/^>\s?/, ''))
        .join('\n')
        .trim();
    const innerHtml = marked.parse(inner, {async: false});

    return `<div class="callout callout-${type_}" data-callout-label="${CALLOUT_LABELS[type_]}">\n\n${innerHtml}\n\n</div>\n\n`;
});

/** Pure Markdown -> HTML-fragment conversion. No I/O, no layout - see layout.ts for the page shell. */
export const renderMarkdown = (markdown: string): string => marked.parse(renderCallouts(markdown), {async: false});
