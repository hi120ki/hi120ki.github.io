# Repository Guidelines

## Project Structure & Module Organization

- Docusaurus 3 site: configuration in `docusaurus.config.ts`, navigation in `sidebars.ts`.
- Content: docs in `docs/`, blog posts in `blog/`, static assets in `static/`, localized strings in `i18n/`.
- UI code: reusable components in `src/components/`, pages and layout overrides in `src/pages/`, global styles in `src/css/`.
- Build output lands in `build/` (generated; do not edit directly).

## Build, Test, and Development Commands

- `npm install` — install dependencies (Node 18+ required).
- `npm run start` — dev server with hot reload at `http://localhost:3000`.
- `npm run start:ja` — dev server using the Japanese locale.
- `npm run build` — production build to `build/`; fails on broken links.
- `npm run serve` — serve the built site locally for smoke checks.
- `npm run typecheck` — TypeScript type validation; run before opening a PR.
- `npm run deploy` — deploy via Docusaurus GitHub Pages pipeline (project owners only).
- `npm run translate` / `npm run write-translations` — generate locale files when adding strings.

## Coding Style & Naming Conventions

- Language: TypeScript/TSX; prefer functional React components and hooks.
- Formatting: 2-space indentation, single quotes, and trailing commas; follow existing file patterns.
- File naming: components in `PascalCase.tsx`, hooks in `useX.ts`, MDX/markdown in `kebab-case.mdx`.
- Imports: keep relative paths short; place third-party imports above local ones.

## Testing Guidelines

- No unit test suite is configured; rely on `npm run typecheck` plus `npm run build` for regressions.
- For content changes, open the dev server and verify pages render, links resolve, and code blocks highlight correctly.
- Snapshot any visual change in your PR (gif or screenshot) to document the result.

## Content & Localization Notes

- Prefer MDX for docs/blog to reuse components (e.g., `import Tabs from '@theme/Tabs'`).
- For new locale strings, run `npm run translate` and commit the generated `i18n/` updates.
- Keep URLs, code fences, and frontmatter consistent with neighboring documents.

## Commit & Pull Request Guidelines

- Commits: present-tense summaries (e.g., `Add hero card`); group related changes; avoid noisy reformat-only commits.
- PRs: include a short summary, testing notes (commands run), and linked issues. Add screenshots for UI/content changes and note locale impact.
- Keep PRs focused; prefer small, reviewable chunks over broad refactors.
