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

### Authentification & Sécurité
Toutes les requêtes doivent inclure un Header : `Authorization: Bearer <votre_token_jwt>`

*   `ADMIN` : Peut créer et supprimer des docteurs.
*   `DOCTEUR` : Peut modifier son profil, gérer son planning et accéder aux patients.
*   `PATIENT` : Peut voir le profil public d'un docteur.

### Docteurs (`/api/doctors`)

| Méthode | Endpoint | Description | Rôles Requis |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Liste tous les docteurs | `ADMIN`, `DOCTEUR` |
| `POST` | `/api/doctors` | Crée un nouveau docteur | `ADMIN` |
| `GET` | `/api/doctors/{id}` | Détails d'un docteur | `ADMIN`, `DOCTEUR`, `PATIENT` |
| `PUT` | `/api/doctors/{id}` | Mise à jour profil | `ADMIN`, `DOCTEUR` |
| `DELETE`| `/api/doctors/{id}` | Supprime un docteur | `ADMIN` |

### Planning (`/api/doctors/planning`)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/{doctorId}` | Voir le planning |
| `POST` | `/` | Ajouter un créneau |

### Opérations Patients & Médical (Proxy)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/patients` | Liste des patients |
| `GET` | `/patients/{id}/medical-record` | Consulter dossier médical |
| `POST` | `/patients/medical-record` | Ajouter note au dossier |
| `POST` | `/prescriptions` | Créer une ordonnance |

## 3. Installation & Docker

Si vous avez modifié le `pom.xml` (ajout de dépendances), vous **devez reconstruire** l'image :

```bash
# Dans le dossier doctor-service
mvn clean package -DskipTests
docker build -t doctor-service .
```
