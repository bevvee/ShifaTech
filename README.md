# ShifaTech Project

## Overview

ShifaTech is a microservices-based application for managing healthcare services.
The project consists of multiple backend services (Spring Boot), a frontend (Angular), and a gateway (Nginx) to route requests.

---

## Project Structure

```
ShifaTech/
│
├── Backend/                  # All backend microservices
│   ├── auth-service/         # Authentication service
│   ├── patient-service/      # Patient management service
│   ├── doctor-service/       # Doctor management service
│   ├── infirmier-service/    # Nurse management service
│   └── rdv-service/          # Appointment service
│
├── Frontend/Web/             # Angular frontend application
│
├── nginx/                    # Nginx configuration for API routing
│   └── default.conf
│
├── docker-compose.yaml       # Docker compose for all services
└── .gitignore                # Ignored files
```

---

## Running the Project

### Requirements

* Docker & Docker Compose
* Node.js and npm (for frontend development)
* Java 17+ (for backend if running without Docker)

### Start all services

1. Open terminal in the project root.
2. Run:

```bash
docker-compose up --build
```

This will start:

* **Nginx Gateway**: [http://localhost:8082](http://localhost:8082)
* **PhpMyAdmin**: [http://localhost:8083](http://localhost:8083)
* All backend microservices and databases.

---

## Accessing the Services

All services are accessible via the **Nginx API Gateway**:

| Service            | URL                                                                  |
| ------------------ | -------------------------------------------------------------------- |
| Authentication     | [http://localhost:8082/auth/](http://localhost:8082/auth/)           |
| Patient Management | [http://localhost:8082/patient/](http://localhost:8082/patient/)     |
| Doctor Management  | [http://localhost:8082/doctor/](http://localhost:8082/doctor/)       |
| Nurse Management   | [http://localhost:8082/infirmier/](http://localhost:8082/infirmier/) |
| Appointment (RDV)  | [http://localhost:8082/rdv/](http://localhost:8082/rdv/)             |

---

## Frontend

* Angular app runs at: [http://localhost:4200/](http://localhost:4200/) (development)
* In production, serve the built frontend using Nginx:

```bash
# Build Angular frontend
cd Frontend/Web
npm install
npm run build

# Copy dist files to nginx/html (optional, if not using Docker)
```

---

## Notes

* Backend services use **Spring Boot** and connect to individual MySQL databases.
* Database credentials are set in the `docker-compose.yaml` environment variables.
* Nginx routes requests to the correct service based on the path.
* `.gitignore` ignores IDE files, node_modules, dist folders, logs, and OS-specific files.

---

## Troubleshooting

* **Cannot access API** → check `docker-compose ps` to ensure all containers are running.
* **Frontend shows Nginx welcome page** → make sure the Angular `dist` files are copied to Nginx or the frontend service is running.
* **Ports already in use** → change `8082` (API) or `4200` (frontend dev server) in `docker-compose.yaml` or `angular.json
