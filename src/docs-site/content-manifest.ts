import path from 'path';

export interface DocPage {
    /** URL segment within the section; '' is the section's own index page. */
    slug: string;
    title: string;
    /**
     * Source Markdown file - absent for a dynamically-rendered page (currently just
     * "Zieltemperaturen", built live from config/*.json on every request - see
     * docs-server.ts's dynamic-route handling and temperatures.ts). Such a page still needs a
     * manifest entry purely so it shows up in the nav with the right title/active-state.
     */
    file?: string;
}

export interface DocSection {
    slug: string;
    title: string;
    pages: DocPage[];
}

// `process.cwd()` (not `__dirname`) on purpose: `__dirname` sits at a different depth under
// `src/docs-site` (ts-jest, running the source directly) vs. `dist/src/docs-site` (the compiled
// output `node dist/index.js` actually runs), while the project root is always the process's
// working directory in every one of those cases (`npm start`/`npm test` locally, and the
// Dockerfile's `WORKDIR /usr/src/app` + `CMD ["node", "dist/index.js"]`).
const ROOT = process.cwd();

export const sections: DocSection[] = [
    {
        slug: 'nutzer',
        title: 'Für Nutzer:innen',
        pages: [
            {slug: '', title: 'Übersicht', file: path.join(ROOT, 'docs/site/nutzer/index.md')},
            {slug: 'heizungslogik', title: 'Heizungslogik', file: path.join(ROOT, 'docs/site/nutzer/heizungslogik.md')},
            {slug: 'zieltemperaturen', title: 'Zieltemperaturen'}, // dynamic - see docs-server.ts
            {slug: 'faq', title: 'FAQ', file: path.join(ROOT, 'docs/site/nutzer/faq.md')},
        ],
    },
    {
        slug: 'technik',
        title: 'Für Entwickler:innen',
        pages: [
            {slug: '', title: 'Übersicht', file: path.join(ROOT, 'docs/site/technik/index.md')},
            {slug: 'komponenten', title: 'Komponenten', file: path.join(ROOT, 'docs/site/technik/komponenten.md')},
            {slug: 'zusammenspiel', title: 'Zusammenspiel', file: path.join(ROOT, 'docs/site/technik/zusammenspiel.md')},
            {slug: 'entwicklung', title: 'Entwicklung & Branching', file: path.join(ROOT, 'docs/site/technik/entwicklung.md')},
        ],
    },
    {
        slug: 'hausverwaltung',
        title: 'Für die Hausverwaltung',
        pages: [
            {slug: '', title: 'Übersicht', file: path.join(ROOT, 'docs/site/hausverwaltung/index.md')},
            {slug: 'grafana', title: 'Grafana-Dashboards', file: path.join(ROOT, 'docs/site/hausverwaltung/grafana.md')},
        ],
    },
];

export const routeFor = (section: DocSection, page: DocPage): string =>
    page.slug === '' ? `/docs/${section.slug}` : `/docs/${section.slug}/${page.slug}`;
