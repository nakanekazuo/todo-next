# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next` core-web-vitals + typescript rules)

There is no test suite configured in this project.

## Architecture

This is a Next.js 16 App Router project (React 19, TypeScript, Tailwind CSS v4). It is a single-page todo app with no backend — everything lives client-side.

- `app/page.tsx` — thin server component that renders `TodoApp` centered on the page.
- `app/components/TodoApp.tsx` — the entire app's state and logic: a `"use client"` component holding all todo state (`useState`), add/toggle/delete/edit (double-click a label to rename inline)/filter (all/active/done)/clear-completed, and all markup. There are no other sub-components; new UI should generally stay inline here unless it grows enough to justify further extraction.
- Persistence is `window.localStorage` under the key `todo-next.todos`, synced via two `useEffect` hooks: one loads on mount, the other saves on every `todos` change (guarded by a `loaded` ref so it doesn't overwrite storage before the initial load completes). The initial-load `setState` intentionally runs inside the effect rather than a lazy `useState` initializer, so the client's first render matches the server-rendered empty state and avoids a hydration mismatch — it carries an `eslint-disable-next-line react-hooks/set-state-in-effect` for this reason.
- `app/layout.tsx` sets up the root HTML shell, Geist fonts, and page metadata. Layout/metadata text is English, but in-app UI copy (placeholders, labels, buttons) is Japanese — keep new UI text in Japanese for consistency with the existing component.
- Path alias `@/*` resolves to the project root (see `tsconfig.json`).
- `next.config.ts` pins the Turbopack root to the project directory.

## Deployment

This repo is connected to a Vercel project (`.vercel/` present) and pushes to `origin` (`github.com/nakanekazuo/todo-next`) trigger auto-deploy.

## Working with this codebase

Because Next.js 16 introduced breaking changes after most training data cutoffs, consult the docs shipped in `node_modules/next/dist/docs/` before using any Next.js API you're not certain about, rather than relying on prior knowledge of Next.js conventions.
