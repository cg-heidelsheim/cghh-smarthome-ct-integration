import path from 'path';

export interface DocPage {
    /** URL segment within the section; '' is the section's own index page. */
    slug: string;
    title: string;
    file: string;
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
            {slug: 'grafana', title: 'Grafana-Dashboards', file: path.join(ROOT, 'docs/site/nutzer/grafana.md')},
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
        slug: 'referenz',
        title: 'Referenz (EN)',
        pages: [
            {slug: 'readme', title: 'README', file: path.join(ROOT, 'README.md')},
            {slug: 'agents', title: 'AGENTS', file: path.join(ROOT, 'AGENTS.md')},
            {slug: 'architecture', title: 'Architecture', file: path.join(ROOT, 'docs/architecture.md')},
            {slug: 'testing-guide', title: 'Testing guide', file: path.join(ROOT, 'docs/testing-guide.md')},
        ],
    },
];

export const routeFor = (section: DocSection, page: DocPage): string =>
    page.slug === '' ? `/docs/${section.slug}` : `/docs/${section.slug}/${page.slug}`;
