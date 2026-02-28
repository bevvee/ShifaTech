# Service Docteur - ShifaTech

Microservice responsable de la gestion des médecins, de leur planning et de l'accès aux dossiers médicaux.

## 1. Fonctionnalités Clés

*   **Gestion Profil Docteur (CRUD)** : Création, lecture, mise à jour, suppression.
*   **Planning** : Gestion des créneaux de disponibilité.
*   **Sécurité** : Validation des Tokens JWT (Role-Based Access Control).
*   **Intégration** :
    *   **Auth Service** : Pour les données utilisateur (Email, Tel).
    *   **Patient Service** : Pour lister les patients, voir les dossiers et prescrire.

## 2. API Endpoints

### Base URL & Nginx
*   **Via Nginx Proxy**: `http://localhost:8082/doctor/`
*   **Direct Service Access**: `http://localhost:8080/api/doctors/`

### Authentification & Sécurité
Toutes les requêtes doivent inclure un Header : `Authorization: Bearer <votre_token_jwt>`

*   `ADMIN` : Accès complet (Création/Suppression).
*   `DOCTEUR` : Accès profil, planning et patients.
*   `PATIENT` : Consultation profils publics.

### Docteurs (`/`)

| Méthode | Endpoint | Description | Rôles Requis |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Liste tous les docteurs | `ADMIN`, `DOCTEUR` |
| `POST` | `/` | Crée un nouveau docteur | `ADMIN` |
| `GET` | `/{id}` | Détails d'un docteur | `ADMIN`, `DOCTEUR`, `PATIENT` |
| `PUT` | `/{id}` | Mise à jour profil | `ADMIN`, `DOCTEUR` |
| `DELETE`| `/{id}` | Supprime un docteur | `ADMIN` |

### Planning (`/planning`)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/{doctorId}` | Consulter planning |
| `POST` | `/` | Ajouter un créneau |

### Opérations Patients & Médical (Proxy vers Patient Service)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/patients` | Liste des patients |
| `GET` | `/patients/{id}/medical-record` | Consulter dossier médical |
| `POST` | `/patients/medical-record` | Créer/Maj dossier médical |
| `POST` | `/prescriptions` | Générer ordonnance |

## 3. Installation & Docker

Si vous avez modifié le `pom.xml` (ajout de dépendances), vous **devez reconstruire** l'image :

```bash
# Dans le dossier doctor-service
mvn clean package -DskipTests
docker build -t doctor-service .
```
