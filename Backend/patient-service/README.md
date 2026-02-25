# ShifaTech - Patient Service

Le `patient-service` est un microservice central du système ShifaTech, responsable de la gestion des patients, des dossiers médicaux, des ordonnances et des visites.

## 🚀 Travaux Récents & Standardisation

Nous avons finalisé une refonte complète de la sécurité et de la structure du service :

1.  **Standardisation RBAC (Français)** : Tous les rôles ont été standardisés en français (`ADMIN`, `DOCTEUR`, `INFIRMIER`, `PATIENT`) pour une cohérence totale avec le reste de l'écosystème.
2.  **Défense en Profondeur** : La sécurité est appliquée à deux niveaux :
    *   **Layer API (Contrôleurs)** : Utilisation de `@PreAuthorize` pour le filtrage des accès HTTP.
    *   **Layer Métier (Services)** : Vérifications de sécurité internes pour empêcher tout accès non autorisé aux données sensibles, même via des appels internes.
3.  **Nettoyage du Code** : Suppression des composants inutilisés (DTOs, méthodes mortes) et correction des incohérences de rôles.

---

## 🔐 Système de Rôles (RBAC)

| Rôle | Description |
| :--- | :--- |
| **`ADMIN`** | Accès complet, seul habilité à supprimer des patients. |
| **`DOCTEUR`** | Peut consulter tous les dossiers, créer des ordonnances et lister les patients. |
| **`INFIRMIER`** | Responsable de la création/mise à jour des patients et dossiers, ainsi que du suivi des visites. |
| **`PATIENT`** | Peut consulter son propre profil et son dossier médical. |

---

## 📂 Documentation des APIs

### 📋 Gestion des Patients (`PatientController`)
| Méthode | Endpoint | Description | Rôles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/patient` | Créer un profil patient | `PATIENT`, `INFIRMIER` |
| `GET` | `/api/patient/{id}` | Détails d'un patient par ID | `PATIENT`, `DOCT`, `ADMIN` |
| `GET` | `/api/patient/user/{uId}`| Détails par ID utilisateur | `PATIENT`, `DOCT`, `ADMIN` |
| `GET` | `/api/patient` | Lister tous les patients | `DOCTEUR`, `ADMIN` |
| `PUT` | `/api/patient/{id}` | Mettre à jour un patient | `PATIENT`, `INFIRMIER` |
| `DELETE` | `/api/patient/{id}` | Suppression (soft delete) | `ADMIN` |

### 📁 Dossiers Médicaux (`DossierMedicalController`)
| Méthode | Endpoint | Description | Rôles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/patient/{idP}/dossier-medical`| Consulter le dossier | `PATIENT`, `DOCT`, `ADMIN` |
| `GET` | `/api/patient/dossiers` | Lister tous les dossiers | `INFIRMIER`, `DOCT`, `ADMIN`|
| `POST` | `/api/patient/dossier-medical` | Créer un dossier | `INFIRMIER` |
| `PUT` | `/api/patient/{idP}/dossier-medical` | Modifier un dossier | `INFIRMIER` |
| `DELETE` | `/api/patient/{idP}/dossier-medical` | Archiver un dossier | `INFIRMIER`, `ADMIN`|

### 💊 Ordonnances (`OrdonnanceController`)
| Méthode | Endpoint | Description | Rôles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/patient/ordonnances` | Créer une ordonnance | `DOCTEUR` |
| `GET` | `/api/patient/ordonnances/{id}` | Détails d'ordonnance | `DOCTEUR`, `ADMIN` |
| `DELETE` | `/api/patient/ordonnances/{id}`| Supprimer ordonnance | `DOCTEUR` |

### 🏥 Visites (`VisiteController`)
| Méthode | Endpoint | Description | Rôles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/patient/visites` | Créer une visite | `INFIRMIER` |
| `GET` | `/api/patient/visites` | Lister les visites | `ANY STAFF` |
| `DELETE` | `/api/patient/visites/{id}` | Supprimer une visite | `ADMIN`, `INFIRMIER` |

---

## 🛠️ Tests & Développement

### JWT.IO
Pour tester les accès, générez des tokens sur [jwt.io](https://jwt.io) avec le secret défini dans `application.properties`.
- **Payload requis** : `{"sub": "USER_ID", "role": "NOM_DU_ROLE_EN_FRANCAIS"}`

### Postman
Un guide détaillé pour les tests Postman est disponible dans l'artefact `testing_guide.md`.

### APIs Internes
Le service expose également des endpoints sous `/api/patient/internal/**` restreints au rôle `ADMIN` (communication inter-services).
