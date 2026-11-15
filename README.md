# Naim Althabatah — Portfolio

Next.js portfolio covering cybersecurity, freelance full-stack development, cloud integrations, and technical writeups. This repository is independent of `edc_website`; it only links to that public project as a case study.

## Run locally

```sh
npm ci
npm run dev
```

`predev` and `prebuild` prepare the archived CTF library automatically. No database, API keys, or paid services are required.

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## Content

- `lib/portfolio.ts`: profile, project case studies, credentials, skills.
- `lib/reports.ts`: clearly scoped lab summaries and learning notes.
- `app/legacy/page.tsx`: competition results already present in the old portfolio.
- `public/Naim-Althabatah-CV.docx`: owner-provided downloadable CV.
- `legacy/ctf-portfolio/`: original CTF library and writeups, preserved.
- `scripts/prepare-archive.mjs`: copies the library into generated `public/archive/` for Next.js hosting. Do not edit the generated copy.
- `index.html`: previous static portfolio, preserved for reference. Next.js serves `app/page.tsx`, not this file.

## Routes

`/`, `/work/educational-platform`, `/work/qrshield`, `/work/attack-defense-lab`, `/labs`, `/reports`, `/reports/wazuh-lab`, `/reports/phishing-investigation`, `/legacy`, `/archive/wrup/index.html`.

Older `/wrup/*`, `/writeups/index.html`, and `/legacy/ctf-portfolio/*` links redirect to the served archive. Unknown projects and reports use the 404 page.

## Hosting

The redesign targets the existing Next.js / Vercel application. It is not an export for GitHub Pages. The old static `index.html` is intentionally retained; switching the primary portfolio URL or publishing a new production design happens after owner review.

## Update the archive

Follow `legacy/ctf-portfolio/ADD_WRITEUP.md`. Add casefiles under `legacy/ctf-portfolio/wrup/` and update its library data. The next dev/build refreshes the served archive.

## Content accuracy

Content is based on the supplied CV and existing portfolio. Training is labeled separately from certification; ISC2 is candidate status. New CTF / hackathon results are deferred until the owner supplies details. See `PORTFOLIO_TODO.md`.

## Accessibility & motion

The layout uses semantic headings, keyboard navigation, a skip link, visible focus, accessible mobile navigation, and reduced-motion support. Primary content stays visible when JavaScript is disabled. Project illustrations are decorative concepts rather than product screenshots.
