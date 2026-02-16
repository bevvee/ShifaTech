# 🏥 ShifaTech - Patient Service

Microservice de gestion des patients pour la plateforme ShifaTech.

## 📋 Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [API Endpoints](#api-endpoints)
- [Tests](#tests)
- [Docker](#docker)

## 🛠️ Technologies utilisées

- **Java 17**
- **Spring Boot 3.5.7**
- **Spring Data JPA**
- **MySQL 8.0**
- **Maven**
- **Lombok**
- **SpringDoc OpenAPI** (Swagger)
- **Docker**

## 📦 Prérequis

- Java JDK 17 ou supérieur
- Maven 3.9+
- MySQL 8.0+
- Docker & Docker Compose (optionnel)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repo-url>
cd patient-service
```

### 2. Configuration de la base de données

Créer la base de données MySQL :

```bash
mysql -u root -p < init.sql
```

Ou manuellement :

```sql
CREATE DATABASE patientdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurer les variables d'environnement

Copier le fichier `application.yml` et ajuster les paramètres si nécessaire :

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/patientdb
    username: user
    password: user123
```

### 4. Compiler le projet

```bash
mvn clean install
```

## ⚙️ Configuration

### Variables d'environnement disponibles

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `SPRING_DATASOURCE_URL` | URL de connexion MySQL | `jdbc:mysql://localhost:3306/patientdb` |
| `SPRING_DATASOURCE_USERNAME` | Utilisateur MySQL | `user` |
| `SPRING_DATASOURCE_PASSWORD` | Mot de passe MySQL | `user123` |
| `SERVER_PORT` | Port du serveur | `8080` |
| `AUTH_SERVICE_URL` | URL du service d'authentification | `http://auth-service:8080` |

## 🏃 Démarrage

### Mode développement (local)

```bash
mvn spring-boot:run
```

### Mode production (JAR)

```bash
mvn clean package -DskipTests
java -jar target/patient-service-0.0.1-SNAPSHOT.jar
```

L'application sera accessible sur : `http://localhost:8080`

## 📚 API Endpoints

### Documentation Swagger

Accéder à la documentation interactive de l'API :

```
http://localhost:8080/swagger-ui.html
```

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/patients` | Créer un nouveau patient |
| `GET` | `/api/patients` | Lister tous les patients |
| `GET` | `/api/patients/{id}` | Récupérer un patient par ID |
| `GET` | `/api/patients/user/{userId}` | Récupérer un patient par ID utilisateur |
| `PUT` | `/api/patients/{id}` | Mettre à jour un patient |
| `DELETE` | `/api/patients/{id}` | Supprimer un patient (soft delete) |

### Exemples de requêtes

#### Créer un patient

```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{
    "idUser": 123,
    "poids": 75.5,
    "taille": 178.0,
    "groupeSanguin": "A+",
    "allergies": "Pénicilline",
    "contactUrgenceNom": "Mohamed Alami",
    "contactUrgenceTel": "+212612345678"
  }'
```

#### Récupérer un patient

```bash
curl -X GET http://localhost:8080/api/patients/1
```

#### Mettre à jour un patient

```bash
curl -X PUT http://localhost:8080/api/patients/1 \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{
    "poids": 76.0,
    "taille": 178.5
  }'
```

## 🧪 Tests

### Exécuter les tests unitaires

```bash
mvn test
```

### Exécuter les tests d'intégration

```bash
mvn verify
```

## 🐳 Docker

### Construire l'image Docker

```bash
docker build -t shifatech/patient-service:1.0.0 .
```

### Lancer avec Docker Compose

Le service est déjà configuré dans le `docker-compose.yml` principal du projet ShifaTech.

```bash
# Depuis la racine du projet ShifaTech
docker-compose up -d patient-service
```

### Variables d'environnement Docker

Les variables sont automatiquement configurées dans le `docker-compose.yml` :

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:mysql://patient-db:3306/patientdb
  SPRING_DATASOURCE_USERNAME: user
  SPRING_DATASOURCE_PASSWORD: user123
  AUTH_SERVICE_URL: http://auth-service:8080
```

## 📊 Structure de la base de données

### Table: `patient`

| Colonne | Type | Description |
|---------|------|-------------|
| `id_patient` | BIGINT | ID unique du patient (PK) |
| `id_user` | BIGINT | Référence vers le service Auth |
| `num_dossier` | VARCHAR(50) | Numéro de dossier médical |
| `poids` | DECIMAL(5,2) | Poids en kg |
| `taille` | DECIMAL(5,2) | Taille en cm |
| `groupe_sanguin` | VARCHAR(5) | Groupe sanguin (ex: A+) |
| `antecedents_medicaux` | TEXT | Antécédents médicaux |
| `allergies` | TEXT | Liste des allergies |
| `pathologies_chroniques` | TEXT | Pathologies chroniques |
| `assurance` | VARCHAR(100) | Nom de l'assurance |
| `statut` | BOOLEAN | Actif/Inactif |
| ... | ... | Champs d'audit |

### Autres tables

- `dossier_medical` : Dossiers médicaux des patients
- `visite` : Visites médicales
- `ordonnance` : Prescriptions médicales

## 🔐 Sécurité

- JWT pour l'authentification (via le service Auth)
- CORS configuré pour le développement
- Validation des données avec Bean Validation
- Soft delete pour préserver l'historique

## 📝 Logs

Les logs sont configurés pour afficher :

- Les requêtes SQL (mode DEBUG)
- Les opérations CRUD
- Les erreurs et exceptions

Emplacement des logs : console + fichier (si configuré)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 👥 Équipe

- Oussama 
- Amine
- Nissrine
- Farah
- Chaimae(Patient Service)

## 📄 Licence

EHEI - ShifaTech © 2025-2026

---

**Pour la démo du mercredi :**

1. ✅ Démarrer MySQL
2. ✅ Exécuter `init.sql`
3. ✅ Lancer l'application : `mvn spring-boot:run`
4. ✅ Tester avec Swagger : `http://localhost:8080/swagger-ui.html`
5. ✅ Intégrer avec le front Angular

**Bon courage ! 🚀**