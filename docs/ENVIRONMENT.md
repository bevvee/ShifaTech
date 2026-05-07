Overview

This project supports environment-based database configuration for development and production.

Files

- .env.dev — example local development variables (included)
- .env.prod — placeholders for production (DO NOT commit secrets)

Quickstart — Local Docker Compose (development)

1. Copy the dev env file to .env at the repo root (docker-compose reads .env by default):

```bash
copy .env.dev .env
# or on PowerShell
cp .env.dev .env
```

2. Start Docker Compose:

```bash
docker compose up -d --build
```

Notes:
- The local .env file contains DB hostnames that match the service names in docker-compose (e.g. `auth-db`, `patient-db`).
- Services read DB configuration from environment variables:
  - Spring Boot: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` (or service-specific fallbacks)
  - Symfony/PHP: `DATABASE_URL` (or service-specific `BODY_DATABASE_URL`, `RDV_DATABASE_URL`, etc.)

Production (ECS + RDS)

- Do NOT commit secrets. Store credentials as GitHub Actions secrets or in AWS Secrets Manager and provide them to ECS task definitions.
- Use `.env.prod` as an example for variable names. Typical variables to set per service:
  - `AUTH_DB_HOST`, `AUTH_DB_PORT`, `AUTH_DB_NAME`, `AUTH_DB_USER`, `AUTH_DB_PASSWORD`
  - `PATIENT_DB_*`, `ADMIN_DB_*`, `DOCTOR_DB_*`, `BODY_DB_*`, `RDV_DB_*`, `INF_DB_*`
- In ECS task definitions, set environment variables (or mount from AWS Secrets Manager/Parameter Store) and ensure `APP_ENV=production`.

CI/CD (GitHub Actions)

- Store DB credentials and other secrets in GitHub Actions repo/org secrets.
- In the workflow, pass secrets as environment variables to build steps or to ECR/ECS deployment actions.

Security

- Never commit production secrets.
- Use AWS Secrets Manager / Parameter Store or GitHub Actions secrets to inject secrets at runtime.

If you want, I can:
- Add a sample GitHub Actions workflow that builds images and deploys to ECR/ECS using these env vars.
- Run a quick local docker-compose test (if you want me to run it here).
