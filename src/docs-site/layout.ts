import {type DocSection, routeFor} from './content-manifest';

interface LayoutOptions {
    sections: DocSection[];
    activeSectionSlug: string;
    activePageSlug: string;
    title: string;
    bodyHtml: string;
}

export const escapeHtml = (value: string): string =>
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

// mermaid is only pulled in (from a CDN, at ~500KB) on pages that actually contain a diagram -
// see docs/site/technik/zusammenspiel.md for the one page that currently uses it.
const MERMAID_MARKER = 'class="mermaid"';

const renderMermaidSupport = (bodyHtml: string): string => {
    if (!bodyHtml.includes(MERMAID_MARKER)) {return '';}

    return `
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({startOnLoad: true, theme: 'neutral', securityLevel: 'strict'});
</script>`;
};

const THEME_SCRIPT = `
<script>
(function () {
  var KEY = 'docs-theme';
  var root = document.documentElement;

  function prefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function isDark() {
    var current = root.getAttribute('data-theme');
    return current === 'dark' || (!current && prefersDark());
  }

  function updateButton() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) {return;}
    var dark = isDark();
    btn.textContent = dark ? '☀️ Hell' : '🌙 Dunkel';
    btn.setAttribute('aria-label', dark ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln');
  }

  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') {root.setAttribute('data-theme', saved);}
  } catch (e) { /* localStorage unavailable (private mode etc.) - fall back to system theme */ }

  document.addEventListener('DOMContentLoaded', function () {
    updateButton();
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = isDark() ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
        updateButton();
      });
    }

    var nav = document.getElementById('site-nav');
    var navToggle = document.getElementById('nav-toggle');
    if (nav && navToggle) {
      var setExpanded = function (expanded) {
        nav.classList.toggle('nav-expanded', expanded);
        navToggle.setAttribute('aria-expanded', String(expanded));
        navToggle.setAttribute('aria-label', expanded ? 'Menü schließen' : 'Menü öffnen');
        navToggle.textContent = expanded ? '✕' : '☰';
      };
      navToggle.addEventListener('click', function () {
        setExpanded(!nav.classList.contains('nav-expanded'));
      });
      // Navigating to a new page is a full page load anyway, but closing on click makes
      // the tap feel like it did something immediately rather than waiting on navigation.
      var navLinks = document.getElementById('nav-links');
      if (navLinks) {
        navLinks.addEventListener('click', function (event) {
          if (event.target && event.target.tagName === 'A') {setExpanded(false);}
        });
      }
    }
  });
})();
</script>`;

/** Pure HTML-page shell (nav + content). No I/O, no Markdown parsing - see markdown-renderer.ts. */
export const renderLayout = ({sections, activeSectionSlug, activePageSlug, title, bodyHtml}: LayoutOptions): string => `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} - ChurchTools-Heizungsintegration</title>
<link rel="icon" type="image/png" href="/docs/assets/favicon.png">
<style>
  :root {
    color-scheme: light;
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
    --callout-note: #2563a8;
    --callout-note-bg: #e5eefb;
    --callout-tip: #1a7f4b;
    --callout-tip-bg: #e3f5eb;
    --callout-important: #7c3aed;
    --callout-important-bg: #efe6fd;
    --callout-warning: #b5541f;
    --callout-warning-bg: #fbe9dc;
    --callout-caution: #b3261e;
    --callout-caution-bg: #fbe2e0;
    --callout-kontakt: #0f766e;
    --callout-kontakt-bg: #dff3f1;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --bg: #1b1917;
      --bg-nav: #16140f;
      --bg-code: #292623;
      --bg-code-block: #0f0d0b;
      --fg-code-block: #e7e5e4;
      --border: #34302a;
      --text: #ede9e3;
      --text-muted: #a89e93;
      --accent: #e8935c;
      --accent-soft: #3a2a1c;
      --link: #f0a877;
      --shadow: none;
      --callout-note: #7fb2e8;
      --callout-note-bg: #1c2a38;
      --callout-tip: #7cd6a4;
      --callout-tip-bg: #17281f;
      --callout-important: #c3a3fb;
      --callout-important-bg: #271f38;
      --callout-warning: #f0a877;
      --callout-warning-bg: #332318;
      --callout-caution: #f19a94;
      --callout-caution-bg: #332019;
      --callout-kontakt: #6fd8cd;
      --callout-kontakt-bg: #16302c;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --bg: #1b1917;
    --bg-nav: #16140f;
    --bg-code: #292623;
    --bg-code-block: #0f0d0b;
    --fg-code-block: #e7e5e4;
    --border: #34302a;
    --text: #ede9e3;
    --text-muted: #a89e93;
    --accent: #e8935c;
    --accent-soft: #3a2a1c;
    --link: #f0a877;
    --shadow: none;
    --callout-note: #7fb2e8;
    --callout-note-bg: #1c2a38;
    --callout-tip: #7cd6a4;
    --callout-tip-bg: #17281f;
    --callout-important: #c3a3fb;
    --callout-important-bg: #271f38;
    --callout-warning: #f0a877;
    --callout-warning-bg: #332318;
    --callout-caution: #f19a94;
    --callout-caution-bg: #332019;
    --callout-kontakt: #6fd8cd;
    --callout-kontakt-bg: #16302c;
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
    padding: 24px 20px 40px;
    overflow-y: auto;
  }
  nav a { color: var(--text); text-decoration: none; }
  .nav-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
  }
  .nav-brand {
    display: block;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: -0.01em;
    line-height: 1.3;
  }
  .theme-toggle {
    flex: 0 0 auto;
    font: inherit;
    font-size: 0.78rem;
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 5px 10px;
    cursor: pointer;
    white-space: nowrap;
  }
  .theme-toggle:hover { border-color: var(--accent); color: var(--accent); }
  .nav-toggle {
    display: none;
    flex: 0 0 auto;
    font: inherit;
    font-size: 1rem;
    line-height: 1;
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 7px 11px;
    cursor: pointer;
  }
  .nav-tagline {
    margin: 4px 0 20px;
    font-size: 0.78rem;
    color: var(--text-muted);
  }
  .nav-section h2 {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin: 22px 0 6px;
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
    transition: background-color 0.1s ease;
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
    max-width: 740px;
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
  .page h2 .heading-anchor, .page h3 .heading-anchor {
    opacity: 0;
    margin-left: 6px;
    font-weight: 400;
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.85em;
  }
  .page h2:hover .heading-anchor, .page h3:hover .heading-anchor { opacity: 1; }
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
  .page .mermaid {
    margin: 1.4em 0;
    padding: 12px;
    background: var(--bg-code);
    border: 1px solid var(--border);
    border-radius: 10px;
    text-align: center;
  }
  .page .mermaid svg { max-width: 100%; height: auto; }
  .callout {
    margin: 1.4em 0;
    padding: 14px 18px;
    border-radius: 10px;
    border-left: 4px solid var(--callout-note);
    background: var(--callout-note-bg);
  }
  .callout::before {
    content: attr(data-callout-label);
    display: block;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .callout > :last-child { margin-bottom: 0; }
  .callout-tip { border-left-color: var(--callout-tip); background: var(--callout-tip-bg); }
  .callout-important { border-left-color: var(--callout-important); background: var(--callout-important-bg); }
  .callout-warning { border-left-color: var(--callout-warning); background: var(--callout-warning-bg); }
  .callout-caution { border-left-color: var(--callout-caution); background: var(--callout-caution-bg); }
  .callout-kontakt { border-left-color: var(--callout-kontakt); background: var(--callout-kontakt-bg); }
  @media (max-width: 760px) {
    body { flex-direction: column; }
    nav {
      flex: 0 0 auto;
      border-right: none;
      border-bottom: 1px solid var(--border);
      padding: 14px 20px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .nav-toggle { display: inline-flex; align-items: center; justify-content: center; }
    .nav-links { display: none; }
    nav.nav-expanded .nav-links { display: block; padding-top: 16px; }
    main { padding: 32px 20px 60px; }
  }
</style>
</head>
<body>
<nav id="site-nav">
  <div class="nav-top">
    <a class="nav-brand" href="/docs/nutzer">ChurchTools-Heizungsintegration</a>
    <div class="nav-actions">
      <button type="button" id="theme-toggle" class="theme-toggle">🌙 Dunkel</button>
      <button type="button" id="nav-toggle" class="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Menü öffnen">☰</button>
    </div>
  </div>
  <div class="nav-links" id="nav-links">
    <p class="nav-tagline">Dokumentation</p>
    ${renderNav(sections, activeSectionSlug, activePageSlug)}
  </div>
</nav>
<main>
<div class="page">
${renderBreadcrumb(sections, activeSectionSlug, activePageSlug)}
${bodyHtml}
</div>
</main>
${renderMermaidSupport(bodyHtml)}
${THEME_SCRIPT}
</body>
</html>
`;
