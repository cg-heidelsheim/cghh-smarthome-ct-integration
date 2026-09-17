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

const activeSection = (sections: DocSection[], activeSectionSlug: string): DocSection | undefined =>
    sections.find((section) => section.slug === activeSectionSlug);

const activePageTitle = (sections: DocSection[], activeSectionSlug: string, activePageSlug: string): string | undefined =>
    activeSection(sections, activeSectionSlug)?.pages.find((page) => page.slug === activePageSlug)?.title;

const renderBreadcrumb = (sections: DocSection[], activeSectionSlug: string, activePageSlug: string): string => {
    const section = activeSection(sections, activeSectionSlug);
    if (!section) {return '';}

    const pageTitle = activePageTitle(sections, activeSectionSlug, activePageSlug);
    const crumbs = [escapeHtml(section.title), pageTitle && pageTitle !== section.pages[0]?.title ? escapeHtml(pageTitle) : null]
        .filter((crumb): crumb is string => Boolean(crumb));

    return `<p class="breadcrumb">${crumbs.join(' <span aria-hidden="true">&rsaquo;</span> ')}</p>`;
};

/** Pure HTML-page shell (nav + content). No I/O, no Markdown parsing - see markdown-renderer.ts. */
export const renderLayout = ({sections, activeSectionSlug, activePageSlug, title, bodyHtml}: LayoutOptions): string => `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} - ChurchTools-Heizungsintegration</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #fbfbfa;
    --bg-nav: #f4f3f0;
    --bg-code: #f1efea;
    --bg-code-block: #292524;
    --fg-code-block: #e7e5e4;
    --border: #e5e3dd;
    --text: #23201b;
    --text-muted: #78716c;
    --accent: #b5541f;
    --accent-soft: #f3e3d6;
    --link: #9a4315;
    --shadow: 0 1px 2px rgba(35, 32, 27, 0.04);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1b1917;
      --bg-nav: #16140f;
      --bg-code: #292623;
      --bg-code-block: #16140f;
      --fg-code-block: #e7e5e4;
      --border: #34302a;
      --text: #ede9e3;
      --text-muted: #a89e93;
      --accent: #e8935c;
      --accent-soft: #3a2a1c;
      --link: #f0a877;
      --shadow: none;
    }
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    display: flex;
    min-height: 100vh;
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.65;
    color: var(--text);
    background: var(--bg);
  }
  a { color: var(--link); }
  nav {
    flex: 0 0 272px;
    background: var(--bg-nav);
    border-right: 1px solid var(--border);
    padding: 28px 20px 40px;
    overflow-y: auto;
  }
  nav a { color: var(--text); text-decoration: none; }
  .nav-brand {
    display: block;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: -0.01em;
    margin: 0 0 4px;
  }
  .nav-tagline {
    margin: 0 0 24px;
    font-size: 0.78rem;
    color: var(--text-muted);
  }
  .nav-section h2 {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin: 24px 0 6px;
  }
  .nav-section:first-of-type h2 { margin-top: 0; }
  .nav-section ul { list-style: none; margin: 0; padding: 0; }
  .nav-section li a {
    display: block;
    padding: 7px 12px;
    margin: 1px 0;
    border-radius: 7px;
    font-size: 0.92rem;
    border-left: 3px solid transparent;
  }
  .nav-section li a:hover { background: var(--bg-code); }
  .nav-section li a.active {
    background: var(--accent-soft);
    border-left-color: var(--accent);
    font-weight: 600;
    color: var(--accent);
  }
  main {
    flex: 1 1 auto;
    min-width: 0;
    padding: 44px clamp(24px, 6vw, 88px) 80px;
  }
  .page {
    max-width: 720px;
  }
  .breadcrumb {
    margin: 0 0 20px;
    font-size: 0.82rem;
    color: var(--text-muted);
  }
  .page h1 {
    margin: 0 0 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
    font-size: 1.9rem;
    letter-spacing: -0.01em;
  }
  .page h2 {
    font-size: 1.35rem;
    margin: 2.2em 0 0.7em;
    letter-spacing: -0.005em;
  }
  .page h3 {
    font-size: 1.1rem;
    margin: 1.8em 0 0.6em;
  }
  .page h2, .page h3 { scroll-margin-top: 20px; }
  .page p, .page ul, .page ol { margin: 0 0 1.1em; }
  .page li { margin-bottom: 0.35em; }
  .page a { text-underline-offset: 2px; }
  .page a:hover { text-decoration-thickness: 2px; }
  .page code, .page pre {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.87em;
  }
  .page code {
    background: var(--bg-code);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 0.15em 0.4em;
  }
  .page pre {
    background: var(--bg-code-block);
    color: var(--fg-code-block);
    border-radius: 10px;
    padding: 16px 18px;
    overflow-x: auto;
    box-shadow: var(--shadow);
    line-height: 1.55;
  }
  .page pre code { background: none; border: none; padding: 0; color: inherit; }
  .page blockquote {
    margin: 1.2em 0;
    padding: 0.4em 1.2em;
    border-left: 3px solid var(--accent);
    color: var(--text-muted);
    background: var(--bg-code);
    border-radius: 0 8px 8px 0;
  }
  .page table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.2em 0;
    font-size: 0.93rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }
  .page th, .page td {
    border-bottom: 1px solid var(--border);
    padding: 9px 14px;
    text-align: left;
  }
  .page thead th {
    background: var(--bg-code);
    font-weight: 600;
  }
  .page tr:last-child td { border-bottom: none; }
  .page hr { border: none; border-top: 1px solid var(--border); margin: 2.4em 0; }
  @media (max-width: 760px) {
    body { flex-direction: column; }
    nav {
      flex: 0 0 auto;
      border-right: none;
      border-bottom: 1px solid var(--border);
      padding: 20px 20px 8px;
    }
    main { padding: 32px 20px 60px; }
  }
</style>
</head>
<body>
<nav>
  <span class="nav-brand">ChurchTools-Heizungsintegration</span>
  <p class="nav-tagline">Dokumentation</p>
  ${renderNav(sections, activeSectionSlug, activePageSlug)}
</nav>
<main>
<div class="page">
${renderBreadcrumb(sections, activeSectionSlug, activePageSlug)}
${bodyHtml}
</div>
</main>
</body>
</html>
`;
