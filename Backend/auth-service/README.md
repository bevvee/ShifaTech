# Auth-Service Microservice

This is the **Authentication Microservice** of the ShifaTech project, built with **Spring Boot**. It handles user authentication, registration, and profile management using **JWT (JSON Web Tokens)**.

---

## Features

* **Register:** Create a new user account
* **Login:** Authenticate and receive a JWT token
* **Logout:** Invalidate user session
* **Profile:** Fetch details of the authenticated user
* Passwords are securely hashed with **BCrypt**
* Stateless authentication using JWT

---

## Technology Stack

* Java 17+
* Spring Boot
* Spring Security
* JWT for authentication
* Maven
* Database:  MySQL 

---

## API Endpoints

| Method | Endpoint             | Description                    | Request Body                         | Response             |
| ------ | -------------------- | ------------------------------ | ------------------------------------ | -------------------- |
| POST   | `/api/auth/register` | Register a new user            | `{ "username": "", "password": "" }` | `User details + JWT` |
| POST   | `/api/auth/login`    | Authenticate a user            | `{ "username": "", "password": "" }` | `JWT token`          |
| POST   | `/api/auth/logout`   | Logout a user                  | `Authorization: Bearer <token>`      | `Success message`    |
| GET    | `/api/auth/profile`  | Get current authenticated user | `Authorization: Bearer <token>`      | `User details`       |

> **Note:** `/register` and `/login` are public endpoints. All other endpoints require a valid JWT token.

---

## Getting Started

### Prerequisites

* Java 17+ installed
* Maven installed
* Database (MySQL)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/bevvee/ShifaTech.git
cd ShifaTech/auth-service
```

2. Build the project:

```bash
mvn clean install
```

3. Configure `application.properties` in `src/main/resources/`:

```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/auth_db
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
jwt.secret=YourJWTSecretKey
jwt.expirationMs=86400000
```

### Running the Service

```bash
mvn spring-boot:run
```

The service will start on `http://localhost:8080`.

---

## Security

* **Password hashing:** BCrypt
* **Authentication:** Stateless via JWT
* Include JWT in `Authorization` header for protected endpoints:

```http
Authorization: Bearer <your-jwt-token>
```

---

## License

MIT License

---

## Author

* **bevvee** - Initial development
* GitHub: [bevvee](https://github.com/bevvee)
