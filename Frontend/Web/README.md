# ShifaTech Frontend (Angular)

Frontend Angular for ShifaTech:
- **Public website** (landing pages)
- **Management app** (dashboard + CRUD screens)

Tech:
- Angular (Standalone Components + Standalone Routing)
- TailwindCSS (utility-first styling)
- Material Icons (Google Icons font)

---

## 1) Project Structure

Architecture tree:

```text
Web/
├─ .editorconfig
├─ .gitignore
├─ .postcssrc.json
├─ angular.json
├─ Dockerfile
├─ package-lock.json
├─ package.json
├─ README.md
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.spec.json
├─ .angular/
│  └─ cache/21.0.4/Web/
├─ .vscode/
│  ├─ extensions.json
│  ├─ launch.json
│  └─ tasks.json
├─ public/
│  └─ favicon.ico
└─ src/
	├─ index.html
	├─ main.ts
	├─ material-theme.scss
	├─ styles.css
	├─ assets/
	│  └─ images/
	├─ environments/
	│  └─ environment.ts
	└─ app/
		├─ app.ts
		├─ app.html
		├─ app.css
		├─ app.config.ts
		├─ app.routes.ts
		├─ app.spec.ts
		├─ core/
		│  ├─ auth/
		│  │  ├─ guards/
		│  │  └─ services/
		│  ├─ interceptors/
		│  │  └─ auth.interceptor.ts
		│  ├─ layouts/
		│  │  ├─ app-layout/
		│  │  │  ├─ app-layout.css
		│  │  │  ├─ app-layout.html
		│  │  │  └─ app-layout.ts
		│  │  └─ public-layout/
		│  │     ├─ public-layout.css
		│  │     ├─ public-layout.html
		│  │     └─ public-layout.ts
		│  ├─ services/
		│  │  ├─ api.service.ts
		│  │  └─ loader.service.ts
		│  └─ ui/
		│     ├─ sidebar/
		│     │  ├─ sidebar.css
		│     │  ├─ sidebar.html
		│     │  └─ sidebar.ts
		│     └─ topbar/
		│        ├─ topbar.css
		│        ├─ topbar.html
		│        └─ topbar.ts
		├─ shared/
		│  ├─ models/
		│  └─ ui/
		│     ├─ alert/
		│     │  ├─ alert.css
		│     │  ├─ alert.html
		│     │  └─ alert.ts
		│     ├─ confirm-dialog/
		│     │  ├─ confirm-dialog.css
		│     │  ├─ confirm-dialog.html
		│     │  └─ confirm-dialog.ts
		│     ├─ data-table/
		│     │  ├─ data-table.css
		│     │  ├─ data-table.html
		│     │  └─ data-table.ts
		│     ├─ form/
		│     │  ├─ checkbox/
		│     │  │  ├─ checkbox.css
		│     │  │  ├─ checkbox.html
		│     │  │  └─ checkbox.ts
		│     │  ├─ date-input/
		│     │  │  ├─ date-input.css
		│     │  │  ├─ date-input.html
		│     │  │  └─ date-input.ts
		│     │  ├─ file-upload-drop/
		│     │  │  ├─ file-upload-drop.css
		│     │  │  ├─ file-upload-drop.html
		│     │  │  └─ file-upload-drop.ts
		│     │  ├─ form-error/
		│     │  │  ├─ form-error.css
		│     │  │  ├─ form-error.html
		│     │  │  └─ form-error.ts
		│     │  ├─ input/
		│     │  │  ├─ input.css
		│     │  │  ├─ input.html
		│     │  │  └─ input.ts
		│     │  ├─ profile-image/
		│     │  │  ├─ profile-image.css
		│     │  │  ├─ profile-image.html
		│     │  │  └─ profile-image.ts
		│     │  ├─ radio-group/
		│     │  │  ├─ radio-group.css
		│     │  │  ├─ radio-group.html
		│     │  │  └─ radio-group.ts
		│     │  ├─ search/
		│     │  │  ├─ search.css
		│     │  │  ├─ search.html
		│     │  │  └─ search.ts
		│     │  ├─ select-search/
		│     │  │  ├─ select-search.css
		│     │  │  ├─ select-search.html
		│     │  │  └─ select-search.ts
		│     │  └─ textarea/
		│     │     ├─ textarea.css
		│     │     ├─ textarea.html
		│     │     └─ textarea.ts
		│     ├─ icons/
		│     │  └─ Icon.ts
		│     ├─ loading-overlay/
		│     │  ├─ loading-overlay.css
		│     │  ├─ loading-overlay.html
		│     │  └─ loading-overlay.ts
		│     ├─ page-header/
		│     │  ├─ page-header.css
		│     │  ├─ page-header.html
		│     │  └─ page-header.ts
		│     ├─ panel/
		│     │  ├─ panel.css
		│     │  ├─ panel.html
		│     │  └─ panel.ts
		│     └─ stat-card/
		│        ├─ stat-card.css
		│        ├─ stat-card.html
		│        └─ stat-card.ts
		└─ features/
			├─ app/
			│  ├─ app.routes.ts
			│  ├─ admin/
			│  ├─ appointments/
			│  ├─ dashboard/
			│  │  ├─ dashboard.routes.ts
			│  │  ├─ pages/
			│  │  │  └─ dashboard/
			│  │  │     ├─ dashboard.css
			│  │  │     ├─ dashboard.html
			│  │  │     └─ dashboard.ts
			│  │  └─ ui/
			│  │     ├─ appointment-stats/
			│  │     │  ├─ appointment-stats.css
			│  │     │  ├─ appointment-stats.html
			│  │     │  └─ appointment-stats.ts
			│  │     ├─ appointments-widget/
			│  │     │  ├─ appointments-widget.css
			│  │     │  ├─ appointments-widget.html
			│  │     │  └─ appointments-widget.ts
			│  │     ├─ charts/
			│  │     │  └─ appointments-chart/
			│  │     │     ├─ appointments-chart.css
			│  │     │     ├─ appointments-chart.html
			│  │     │     ├─ appointments-chart.spec.ts
			│  │     │     └─ appointments-chart.ts
			│  │     └─ kpi-cards/
			│  │        ├─ kpi-cards.css
			│  │        ├─ kpi-cards.html
			│  │        └─ kpi-cards.ts
			│  ├─ doctors/
			│  │  ├─ doctors.routes.ts
			│  │  └─ pages/
			│  │     ├─ add-doctor/
			│  │     │  ├─ add-doctor.css
			│  │     │  ├─ add-doctor.html
			│  │     │  └─ add-doctor.ts
			│  │     ├─ doctors-list/
			│  │     │  ├─ doctors-list.css
			│  │     │  ├─ doctors-list.html
			│  │     │  └─ doctors-list.ts
			│  │     └─ specializations/
			│  │        ├─ specializations.css
			│  │        ├─ specializations.html
			│  │        └─ specializations.ts
			│  └─ patients/
			├─ auth/
			│  ├─ auth.routes.ts
			│  └─ pages/
			│     └─ login/
			│        ├─ login.css
			│        ├─ login.html
			│        └─ login.ts
			└─ public/
				├─ public.routes.ts
				└─ pages/
					├─ about/
					│  ├─ about.css
					│  ├─ about.html
					│  └─ about.ts
					├─ book/
					│  ├─ book.css
					│  ├─ book.html
					│  └─ book.ts
					├─ contact/
					│  ├─ contact.css
					│  ├─ contact.html
					│  └─ contact.ts
					├─ home/
					│  ├─ home.css
					│  ├─ home.html
					│  └─ home.ts
					└─ services/
					   ├─ services.css
					   ├─ services.html
					   └─ services.ts
```

Key files:
- `src/app/app.routes.ts`: root routes and lazy-loading.
- `src/app/app.config.ts`: bootstrap providers.
- `src/app/core/interceptors/auth.interceptor.ts`: attach/handle auth headers.
- `src/app/core/services/api.service.ts`: HTTP client to backend.
- `src/app/shared/ui/*`: reusable UI components.


### Core idea
- **core/**: app skeleton (layouts, guards, interceptors, global services).
- **shared/ui/**: reusable UI components used by everyone.
- **features/**: real pages/screens grouped by domain (doctors, patients, etc).

---

## 2) Routing Rules

We separate routes into 3 zones:

### Public website
`/` → PublicLayout + public pages  
Routes live in:
- `src/app/features/public/public.routes.ts`

### Auth
`/auth/*` → login, forgot password, etc  
Routes live in:
- `src/app/features/auth/auth.routes.ts`

### Management app
`/app/*` → dashboard & modules  
Routes live in:
- `src/app/features/app/app.routes.ts`

Root router config is in:
- `src/app/app.routes.ts`

✅ When you create a new feature module (ex: doctors), you add routes inside its feature routes file, not in the root.

---

## 3) How We Build Pages

### A “page” goes in `features/`
Example:
- `features/app/doctors/pages/list/`
- `features/app/doctors/pages/add/`

Each page is a standalone component and should be routing entry.

✅ Page components can use shared components from `shared/ui/`.

---

## 4) How to Create a New Component

### A) Create a shared reusable UI component
Use when it will be reused by multiple screens (table, card, modal, input, etc)

Location:
- `src/app/shared/ui/<component-name>/`

Create:
- `<component-name>.ts`
- `<component-name>.html`
(optional) `<component-name>.css`

Example command:
```bash
ng g c shared/ui/badge --standalone --skip-tests

✅ Rule: shared UI components must NOT call APIs.
They take inputs and emit outputs only.

B) Create a feature page component (screen)

Use when it is a real page linked to a route.

Example:

ng g c features/app/doctors/pages/doctors-list --standalone --skip-tests


Then add it to routing:

In features/app/app.routes.ts or features/app/doctors/doctors.routes.ts (if you use a nested routes file)

5) How to Use Existing Shared Components
A) Example: Sidebar

Sidebar exists at:

src/app/shared/ui/sidebar/

Use it in a layout:

import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar';


In template:

<st-sidebar [items]="menu"></st-sidebar>

B) Example: Data Table

Data table exists at:

src/app/shared/ui/data-table/

You pass:

columns config

data array

actions events

6) Styling Rules (Tailwind)

We style using Tailwind utility classes directly in templates:

Spacing: p-4, px-6, mt-4

Layout: flex, grid, gap-4

Colors: text-gray-900, bg-white, border-gray-200

Responsive: sm:*, md:*, lg:*

✅ No random CSS files unless needed.
If you add CSS, keep it scoped and minimal.

7) Material Icons

We use Google Material Icons font.
Usage:

<span class="material-icons">dashboard</span>

8) Team Workflow Rules (Important)
Branching

main is stable

each person creates a branch:

feature/doctors-list

feature/patients-crud

Component ownership

Shared components must be reviewed before merging.

Feature pages can be merged faster.

No hardcoding API URLs

Use environment config or proxy/gateway base URL.

9) Run Locally (Dev)

Install:

npm install


Run dev server:

npm start
# or: ng serve


Open:

http://localhost:4200

10) Docker (Prod)

Build and run:

docker compose build
docker compose up -d


Gateway:

http://localhost:8082

11) Common Do / Don’t

✅ DO:

Put reusable UI in shared/ui

Put pages in features

Use Tailwind classes for styling

Use standalone components (no NgModules)

❌ DON’T:

Mix feature page code inside shared/ui

Add routes in random files

Hardcode URLs

Duplicate UI components instead of reusing

Need Help?

If you add a new feature, follow this checklist:

Create page component in features/...

Add route in correct *.routes.ts

Use shared components from shared/ui

Keep styling in Tailwind