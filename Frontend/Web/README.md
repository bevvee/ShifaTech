# Web

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

-----------------------------------------------------------------------------------

Here’s a clean README section you can paste. It explains exactly what you chose and why.

````md
## Frontend Setup (Angular + Material)

This project uses **Angular (Standalone + Routing)** as the frontend for ShifaTech.  
We selected a **SPA (Single Page Application)** setup (no SSR) because:

- The **management app** is behind authentication (SSR provides little value there).
- It keeps the build/deployment **simple** inside Docker + NGINX gateway.
- Better developer experience for a team (fewer moving parts, fewer runtime issues).

### UI Stack
We use **Angular Material** to speed up development and keep the UI consistent across the team.

**Why Angular Material:**
- Ready-to-use components (toolbar, sidenav, table, dialog, form-field, inputs, datepicker…)
- Consistent design system and accessibility by default
- Reduces custom CSS and merge conflicts in a multi-developer project

### Material Theme
During installation we chose the **Azure/Blue** prebuilt theme:
- Professional look (fits medical/clinic UI)
- Works well for dashboards and public pages
- Can be replaced later with a custom theme

### Installation Steps
1. Create Angular project as SPA (Standalone components + Routing, no SSR)
2. Add Angular Material:
   ```bash
   ng add @angular/material
````

3. Choose:

   * Theme: `Azure/Blue`
   * Global Typography: `Yes`
   * Browser Animations: `Yes`

### Notes

* The prompt asking for “AI tools configuration” was skipped (`None`) because it only adds optional editor/config files and does not affect the Angular application build/runtime.
* The Angular app will be built as static files and served via NGINX inside Docker. Routing is handled by SPA fallback (`try_files ... /index.html`) to support refresh on routes like `/app/dashboard`.

```
## Frontend Architecture (Public Site + Management App)

We use a single Angular project with two clearly separated route trees:

- **Public website** (clinic introduction pages): `/`
- **Management application** (dashboard + modules): `/app/*`
- **Authentication pages**: `/auth/*`

This keeps the codebase clean for a 5-person team and avoids mixing marketing pages with business features.

### Project Structure

```txt
src/app/
  core/
    layouts/
      public-layout/
      app-layout/
    auth/
      guards/
      services/
    interceptors/
  shared/
    ui/
    models/
  features/
    public/
      pages/
        home/
        about/
        services/
        contact/
        book/
      public.routes.ts
    app/
      dashboard/
      appointments/
      patients/
      doctors/
      admin/
      app.routes.ts
    auth/
      pages/login/
      auth.routes.ts

  app.routes.ts
  app.config.ts
  app.component.ts
