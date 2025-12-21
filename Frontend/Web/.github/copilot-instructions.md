# AI Coding Agent Guide for ShifaTech Frontend

These instructions help AI agents work productively in this Angular v21 SSR project. Follow the conventions and use the exact commands/workflows below.

## Architecture Overview
- **Framework:** Angular 21 with standalone components and SSR via `@angular/ssr` + Express 5.
- **Entrypoints:** Browser boot in `src/main.ts`; server boot in `src/main.server.ts`; Express SSR host in `src/server.ts`.
- **Root component:** `src/app/app.ts` (`App`) with `RouterOutlet`; template in `src/app/app.html`.
- **Routing:** Client routes from `src/app/app.routes.ts` (currently empty). Server prerender route in `src/app/app.routes.server.ts` sets `RenderMode.Prerender` for `**`.
- **Config providers:** Client `src/app/app.config.ts` uses `provideRouter(routes)` and `provideClientHydration(withEventReplay())`; server `src/app/app.config.server.ts` merges server rendering via `provideServerRendering(withRoutes(serverRoutes))`.
- **Assets & styles:** Static assets from `public/`. Global styles in `src/styles.css` with Tailwind CSS v4 (`@import "tailwindcss"`) and Material 3 theme in `src/custom-theme.scss`.
- **Build mode:** `angular.json` `build.options.outputMode: "server"` with SSR `entry: src/server.ts`. Styles include `custom-theme.scss` and `styles.css`.

## Developer Workflows
- **Start dev server:** `npm start` (alias for `ng serve`). Opens at http://localhost:4200.
- **Build (SSR output):** `npm run build` (alias for `ng build`). Outputs server/browser bundles under `dist/shifatech-frontend`.
- **Run built SSR server:** `npm run serve:ssr:shifatech-frontend` (runs `node dist/shifatech-frontend/server/server.mjs`). Default port `4000` unless `PORT` env set.
- **Unit tests (Vitest):** `npm test` (alias for `ng test`). Vitest config is managed by Angular CLI `@angular/build:unit-test`.
- **Watch build:** `npm run watch` (`ng build --watch --configuration development`).

## Conventions & Patterns
- **Standalone components:** Use `@Component({ imports: [...] })` and avoid NgModules. Example: `App` imports `RouterOutlet`.
- **Signals:** Prefer Angular signals over `BehaviorSubject` where practical. Example: `title = signal('shifatech-frontend')` in `App`.
- **Routing additions:** Update `src/app/app.routes.ts` for client routes and `src/app/app.routes.server.ts` for server prerender behavior when needed.
- **Providers:** Add client providers in `src/app/app.config.ts`; add server-only providers in `src/app/app.config.server.ts` via `mergeApplicationConfig`.
- **SSR server:** Define Express endpoints in `src/server.ts` (commented template included). Static files served from `../browser` via `express.static`.
- **Styling:** Use Material theming via `src/custom-theme.scss` (`@include mat.theme(...)`) and Tailwind utility classes via `src/styles.css`. Keep component-specific styles in `styleUrl` files (e.g., `src/app/app.css`).
- **Assets:** Place public assets under `public/`; Angular CLI copies them as-is.
- **Prettier:** Respect `package.json` Prettier config (Angular HTML parser, `printWidth: 100`, `singleQuote: true`).

## When Adding Features
- **New page/route:**
  1. Create a standalone component under `src/app/...` with `imports: [...]`.
  2. Add a route object in `src/app/app.routes.ts` with `path` and `loadComponent`/`component`.
  3. If SSR prerender needs customization, adjust `src/app/app.routes.server.ts` (e.g., specific paths or `RenderMode.Server`).
- **HTTP/API endpoints:** Prefer SSR host in `src/server.ts` for server-side endpoints; client-side `HttpClient` calls belong in services. Remember SSR render handler catches all non-static routes.
- **Material/Tailwind:** Use Material components with CSS variables from the theme; mix Tailwind utilities for layout. Keep theme changes in `custom-theme.scss`.

## Key Files
- `src/main.ts`, `src/main.server.ts`, `src/server.ts` — app bootstrapping and SSR host.
- `src/app/app.ts`, `src/app/app.html` — root component and template.
- `src/app/app.config.ts`, `src/app/app.config.server.ts` — client/server providers.
- `src/app/app.routes.ts`, `src/app/app.routes.server.ts` — client/server routing.
- `src/styles.css`, `src/custom-theme.scss` — global styles and Material theme.
- `angular.json`, `package.json` — build/test scripts and options.

## Gotchas
- **SSR output mode:** Build produces server output; run the Node server script to test SSR (`serve:ssr:shifatech-frontend`). Dev `ng serve` uses dev-server and client hydration.
- **Static path:** `server.ts` serves static from `../browser`; ensure assets exist post-build.
- **Hydration:** Client uses `provideClientHydration(withEventReplay())` — avoid direct DOM manipulation that breaks hydration.

## Examples
- Add a lazy route:
  ```ts
  export const routes: Routes = [
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent) },
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
  ];
  ```
- Define a simple Express endpoint in `src/server.ts`:
  ```ts
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  ```
