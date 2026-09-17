import {type DocSection, routeFor} from './content-manifest';

interface LayoutOptions {
    sections: DocSection[];
    activeSectionSlug: string;
    activePageSlug: string;
    title: string;
    bodyHtml: string;
}

const escapeHtml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderNav = (sections: DocSection[], activeSectionSlug: string, activePageSlug: string): string =>
    sections.map((section) => `
        <div class="nav-section">
            <h2>${escapeHtml(section.title)}</h2>
            <ul>
                ${section.pages.map((page) => {
                    const isActive = section.slug === activeSectionSlug && page.slug === activePageSlug;
                    return `<li><a href="${routeFor(section, page)}"${isActive ? ' class="active" aria-current="page"' : ''}>${escapeHtml(page.title)}</a></li>`;
                }).join('\n')}
            </ul>
        </div>
    `).join('\n');

/** Pure HTML-page shell (nav + content). No I/O, no Markdown parsing - see markdown-renderer.ts. */
export const renderLayout = ({sections, activeSectionSlug, activePageSlug, title, bodyHtml}: LayoutOptions): string => `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} - ChurchTools-Heizungsintegration</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    display: flex;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    background: #fff;
  }
  nav {
    flex: 0 0 260px;
    background: #f6f6f4;
    border-right: 1px solid #e2e2e0;
    padding: 24px 16px;
    overflow-y: auto;
  }
  nav a { color: #1a1a1a; }
  .nav-brand { font-weight: 600; margin: 0 0 20px; font-size: 0.95rem; }
  .nav-section h2 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #6b6b68;
    margin: 20px 0 8px;
  }
  .nav-section ul { list-style: none; margin: 0; padding: 0; }
  .nav-section li a {
    display: block;
    padding: 6px 10px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.9rem;
  }
  .nav-section li a:hover { background: #ececea; }
  .nav-section li a.active { background: #dfe7ff; font-weight: 600; }
  main {
    flex: 1 1 auto;
    padding: 40px clamp(20px, 6vw, 80px);
    max-width: 820px;
  }
  main h1 { margin-top: 0; }
  main h2, main h3 { scroll-margin-top: 20px; }
  main code, main pre {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    background: #f2f2f0;
    border-radius: 4px;
  }
  main code { padding: 2px 5px; font-size: 0.9em; }
  main pre { padding: 14px 16px; overflow-x: auto; }
  main pre code { background: none; padding: 0; }
  main table { border-collapse: collapse; width: 100%; }
  main th, main td { border: 1px solid #e2e2e0; padding: 6px 10px; text-align: left; }
  main a { color: #2451c2; }
  @media (max-width: 720px) {
    body { flex-direction: column; }
    nav { flex: 0 0 auto; border-right: none; border-bottom: 1px solid #e2e2e0; }
  }
</style>
</head>
<body>
<nav>
  <p class="nav-brand">ChurchTools-Heizungsintegration</p>
  ${renderNav(sections, activeSectionSlug, activePageSlug)}
</nav>
<main>
${bodyHtml}
</main>
</body>
</html>
`;
