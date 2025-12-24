# ShifaTech – Appointment Service (Symfony + Docker)

This document explains how to run and develop the **Appointment Service** locally using Docker.

---

## 1. Overview

Stack:

- **Symfony 7 (skeleton)** – API (Appointment service)
- **PHP-FPM 8.2** in Docker
- **Nginx** as HTTP server / reverse proxy
- **MySQL 8** as database
- **phpMyAdmin** for DB admin
- All containers connected through a shared Docker network: `shifatech-net`

Main services (from `docker-compose.yml`):

- `appointment-php` – PHP-FPM + Symfony
- `appointment-nginx` – Nginx, exposed on `localhost:8081`
- `appointment-db` – MySQL, exposed on `localhost:3308`
- `appointment-phpmyadmin` – phpMyAdmin, exposed on `localhost:8082`

---

## 2. Requirements

- **Docker Desktop** installed and running
- **Git**
- A code editor (VS Code, PHPStorm, etc.)

Make sure Docker Desktop has access to your project folder (File Sharing).  
On Windows, usually the `C:` drive must be shared in Docker settings.

---

## 3. First-Time Setup

1. **Clone the repository** (or pull latest changes):

   ```bash
   git clone <your_repo_url>
   cd shifaTech_appointment
````

2. **Environment configuration**

    * Copy `.env` if needed or create `.env.local` for local overrides.
    * Example `DATABASE_URL` for Docker (in `.env.local`):

      ```env
      DATABASE_URL="mysql://app_user:app_pass@appointment-db:3306/appointment_db?serverVersion=8.0&charset=utf8mb4"
      ```

3. **Start the stack (build + run)**

   ```bash
   docker compose up -d --build
   ```

   This will:

    * Build the PHP image from `Dockerfile`
    * Start PHP, Nginx, MySQL, phpMyAdmin containers

4. **Create / migrate the database**

   Enter the PHP container:

   ```bash
   docker compose exec appointment-php bash
   ```

   Inside the container:

   ```bash
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate
   ```

   If the DB already exists, `doctrine:database:create` may say it — that’s fine.

---

## 4. Daily Development Workflow

Every time you want to work on the project:

1. **Start Docker containers**

   ```bash
   cd shifaTech_appointment
   docker compose up -d
   ```

   (No `--build` needed unless you changed the `Dockerfile`.)

2. **Open the API in the browser**

    * API (Nginx → Symfony):
      [http://localhost:8081](http://localhost:8081)

3. **Open phpMyAdmin**

    * phpMyAdmin:
      [http://localhost:8082](http://localhost:8082)

   Default login (depends on `docker-compose.yml`):

    * Server: `appointment-db`
    * User: `root`
    * Password: `root`

   or use `app_user` / `app_pass` if configured.

4. **Edit code**

    * The project directory is mounted inside the container:

      ```yaml
      volumes:
        - .:/var/www/html
      ```

    * Any changes in your editor are immediately visible in the container (no rebuild required).

5. **Run Symfony commands**

   Enter the PHP container:

   ```bash
   docker compose exec appointment-php bash
   ```

   Then inside:

   ```bash
   php bin/console debug:router
   php bin/console make:entity
   php bin/console doctrine:migrations:migrate
   php bin/phpunit
   ```

6. **Stop containers when you’re done**

   ```bash
   docker compose down
   ```

---

## 5. Adding Composer Dependencies

To add a new PHP package:

1. Enter the PHP container:

   ```bash
   docker compose exec appointment-php bash
   ```

2. Run Composer **inside** the container:

   ```bash
   composer require vendor/package
   ```

3. Commit the updated `composer.json` and `composer.lock`.

---

## 6. Rebuilding the Docker Image

You only need to rebuild when:

* `Dockerfile` changes (PHP extensions, system packages, etc.)
* or you want a fresh image

Rebuild + start:

```bash
docker compose up -d --build
```

If you just changed PHP code / Symfony config, **no rebuild is required** — `docker compose up -d` is enough.

---

## 7. Logs & Debugging

### View container status

```bash
docker compose ps
```

### View logs for a specific service

```bash
docker compose logs -f appointment-php
docker compose logs -f appointment-nginx
docker compose logs -f appointment-db
docker compose logs -f appointment-phpmyadmin
```

### Common issues

* **Connection refused (MySQL)**
  → Check `DATABASE_URL` host: should be `appointment-db` (service name), not `127.0.0.1`.

* **Access denied (MySQL)**
  → Verify credentials in `.env(.local)` match `MYSQL_USER` / `MYSQL_PASSWORD` from `docker-compose.yml`.

* **Cannot access project files in container**
  → Check the `volumes` section and file sharing settings in Docker Desktop (especially on Windows).

---

## 8. Branch / Git Guidelines (suggested)

* Main branch: `main` (or `master`)

* For new features, create feature branches:

  ```bash
  git checkout -b feature/appointments-crud
  ```

* Commit small, logical changes:

  ```bash
  git add .
  git commit -m "Implement appointment creation API"
  git push origin feature/appointments-crud
  ```

---

## 9. Quick Command Cheat Sheet

**Start services:**

```bash
docker compose up -d
```

**Start + rebuild images:**

```bash
docker compose up -d --build
```

**Stop services:**

```bash
docker compose down
```

**Enter PHP container:**

```bash
docker compose exec appointment-php bash
```

**Run migrations (inside container):**

```bash
php bin/console doctrine:migrations:migrate
```

**Run tests (inside container):**

```bash
php bin/phpunit
```

**Open:**

* API: `http://localhost:8081`
* phpMyAdmin: `http://localhost:8082`
