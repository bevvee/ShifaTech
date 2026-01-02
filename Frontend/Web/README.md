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

Main folders:

src/app/
core/
layouts/
public-layout/
app-layout/
auth/
guards/
services/
interceptors/
services/ # global services (loader, auth, storage...)
shared/
models/ # interfaces/types
ui/ # reusable components (table, sidebar, navbar, cards...)
features/
public/
pages/ # landing pages
public.routes.ts
app/
dashboard/
doctors/
patients/
appointments/
...
app.routes.ts
auth/
pages/login/
auth.routes.ts

app.routes.ts # root routing
app.config.ts
app.component.ts


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