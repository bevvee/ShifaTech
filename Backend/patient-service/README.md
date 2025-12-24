# Micro-service Patient - ShifaTech

Micro-service dédié à la gestion des fonctionnalités côté patient pour la plateforme ShifaTech.

## 📌 Description

Le micro-service Patient est un service autonome, dédié exclusivement aux fonctionnalités côté patient, sans gestion de création ou suppression de comptes patients (géré par le service d'authentification). Ce service permet au patient authentifié d'accéder à son espace personnel pour consulter et gérer ses informations médicales et administratives.

### Fonctionnalités

- ✅ Gestion du profil patient (consultation et mise à jour des informations personnelles)
- ✅ Consultation de sa fiche patient (affiche)
- ✅ Consultation de ses ordonnances
- ✅ Consultation de son dossier médical (historique des consultations, diagnostics et notes médicales)
- ✅ Consultation de l'historique des rendez-vous
- ✅ Prise de rendez-vous en ligne et annulation de rendez-vous
- ✅ Accès sécurisé aux données, uniquement pour le patient propriétaire

## 🚀 Démarrage rapide

### Option 1 : Avec Docker Compose (Recommandé)

#### Prérequis
- Docker Desktop installé et démarré
- Docker Compose installé

#### Commandes

1. **Construire et démarrer tous les services** :
```bash
docker-compose up --build
```

2. **Démarrer en arrière-plan** :
```bash
docker-compose up -d --build
```

3. **Voir les logs** :
```bash
docker-compose logs -f spring-app
```

4. **Arrêter les services** :
```bash
docker-compose down
```

#### Services disponibles

- **Application Spring Boot** : http://localhost:8080
- **Interface Web de Test** : http://localhost:8080 (interface professionnelle pour tester tous les endpoints)
- **MySQL** : localhost:3307
- **phpMyAdmin** : http://localhost:8081
- **Swagger UI** : http://localhost:8080/swagger-ui.html

### Option 2 : Exécution locale (Sans Docker)

#### Prérequis
- Java 17 ou supérieur
- Maven 3.6+
- MySQL 8.0 installé et démarré

#### Configuration

1. **Créer la base de données** :
```sql
CREATE DATABASE shifatech_patient;
CREATE USER 'user'@'localhost' IDENTIFIED BY 'user123';
GRANT ALL PRIVILEGES ON shifatech_patient.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Compiler et exécuter** :
```bash
# Windows
.\mvnw.cmd clean spring-boot:run

# Linux/Mac
./mvnw clean spring-boot:run
```

## 🧪 Tests

### Interface Web de Test

Une interface web professionnelle est disponible pour tester tous les endpoints :

1. Démarrez le service
2. Ouvrez votre navigateur : http://localhost:8080
3. Testez tous les endpoints directement depuis l'interface

### Test du Health Check

```bash
curl http://localhost:8080/api/patient/health
```

Réponse attendue : `Patient Service is running!`

### Mode Développement (Sans Authentification)

Par défaut, l'authentification JWT est **désactivée** pour faciliter les tests. Vous pouvez tester tous les endpoints sans token.

Pour activer l'authentification en production, définissez dans `application.properties` :
```properties
security.jwt.enabled=true
```

Ou via variable d'environnement :
```bash
JWT_ENABLED=true
```

### Test avec JWT Token (Production)

En production, les tokens JWT doivent être générés par le **service d'authentification**. Le service Patient valide uniquement les tokens reçus.

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/patient/profile/1
```

**Important** : Les deux services (Auth et Patient) doivent partager la même clé secrète JWT (`JWT_SECRET`).

## 📋 Endpoints API

### Health Check
- `GET /api/patient/health` - Vérifier l'état du service (sans authentification)

### Profil Patient
- `GET /api/patient/profile/{idUser}` - Consulter son profil
- `PUT /api/patient/profile/{idUser}` - Mettre à jour son profil (poids, taille, téléphone, adresse)

### Dossier Médical
- `GET /api/patient/{idPatient}/dossier-medical` - Consulter son dossier médical
- `GET /api/patient/{idPatient}/dossier-medical/exists` - Vérifier l'existence du dossier

### Ordonnances
- `GET /api/patient/{idPatient}/ordonnances` - Consulter toutes ses ordonnances
- `GET /api/patient/ordonnances/{idOrdonnance}` - Consulter une ordonnance spécifique

### Affiches
- `GET /api/patient/{idPatient}/affiches` - Consulter ses affiches
- `GET /api/patient/affiches/all` - Consulter toutes les affiches publiques
- `GET /api/patient/affiches/{idAffiche}` - Consulter une affiche spécifique

### Rendez-vous
- `POST /api/patient/rendez-vous` - Prendre un rendez-vous
- `GET /api/patient/{idUser}/rendez-vous` - Consulter ses rendez-vous
- `GET /api/patient/{idUser}/rendez-vous/historique` - Consulter l'historique
- `DELETE /api/patient/rendez-vous/{idRendezVous}` - Annuler un rendez-vous

## 🔐 Sécurité

### Architecture JWT

- **Service d'authentification** : Génère les tokens JWT lors de la connexion
- **Service Patient** : Valide les tokens JWT reçus (ne génère pas de tokens)
- **Clé secrète partagée** : Les deux services doivent utiliser la même `JWT_SECRET`

### Configuration

Dans `application.properties` :
```properties
# JWT Configuration
jwt.secret=${JWT_SECRET:shifatech-secret-key-for-jwt-token-generation-and-validation-minimum-256-bits}

# Activer/désactiver l'authentification
security.jwt.enabled=${JWT_ENABLED:false}
```

### Format de l'en-tête

```
Authorization: Bearer <votre_token_jwt>
```

## 🗄️ Base de données

### Entités

- **Patient** : Informations médicales du patient (poids, taille, numéro de dossier)
- **DossierMedical** : Dossier médical complet (notes, diagnostic, historique)
- **Ordonnance** : Prescriptions médicales
- **Affiche** : Fiches et communications du patient

### Configuration

- **Base de données** : `shifatech_patient`
- **Port MySQL** : `3307` (Docker) ou `3306` (local)
- **Utilisateur** : `user`
- **Mot de passe** : `user123`

## 🔗 Dépendances externes

Ce micro-service communique avec :
- **Service d'authentification** : Pour récupérer les informations utilisateur (URL configurable via `AUTH_SERVICE_URL`)
- **Service Rendez-vous** : Pour gérer les rendez-vous (URL configurée dans `RendezVousClientService`)

## 🐛 Dépannage

### Le service ne démarre pas

1. **Vérifier que MySQL est démarré** :
```bash
docker-compose ps
```

2. **Vérifier les logs** :
```bash
docker-compose logs spring-app
```

3. **Reconstruire complètement** :
```bash
docker-compose down
docker-compose up --build
```

### Erreur de connexion à la base de données

- Vérifier que le service MySQL est démarré
- Vérifier les credentials dans `application.properties` ou `docker-compose.yml`
- Vérifier que le port 3307 n'est pas déjà utilisé

### Erreur 404 sur les endpoints

- Vérifier que l'URL est correcte (commence par `/api/patient/`)
- Vérifier que le service est bien démarré
- Vérifier les logs pour plus de détails

### Erreur JWT (si activé)

- Vérifier que le `JWT_SECRET` est configuré correctement
- Vérifier que le token JWT est valide et non expiré
- Vérifier que le token provient du service d'authentification
- Vérifier que les deux services partagent la même clé secrète

## 📝 Structure du projet

```
patient-service/
├── src/
│   ├── main/
│   │   ├── java/com/shifatech/patient_service/
│   │   │   ├── client/          # Clients pour autres micro-services
│   │   │   ├── config/          # Configurations (Security, CORS, etc.)
│   │   │   ├── controller/      # Contrôleurs REST
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # Entités JPA
│   │   │   ├── repository/      # Repositories JPA
│   │   │   ├── security/        # Configuration sécurité JWT
│   │   │   └── service/         # Services métier
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           └── index.html   # Interface web de test
│   └── test/                    # Tests unitaires
├── docker-compose.yml
├── Dockerfile
├── pom.xml
└── README.md
```

## 🛠️ Technologies utilisées

- **Spring Boot 3.5.7**
- **Spring Data JPA**
- **Spring Security** (JWT)
- **MySQL 8.0**
- **Docker & Docker Compose**
- **Maven**

## 📊 Documentation API

Une fois le service démarré :
- **Interface Web** : http://localhost:8080
- **Swagger UI** : http://localhost:8080/swagger-ui.html
- **OpenAPI JSON** : http://localhost:8080/v3/api-docs

## 🎯 Notes importantes

- ⚠️ **Mode développement** : L'authentification JWT est désactivée par défaut (`security.jwt.enabled=false`)
- ⚠️ **Production** : Activez l'authentification en définissant `JWT_ENABLED=true`
- ⚠️ **Service Auth** : Les tokens JWT doivent être générés par le service d'authentification, pas par ce service
- ⚠️ **Clé secrète** : Les services Auth et Patient doivent partager la même `JWT_SECRET`

## 📞 Support

Pour toute question ou problème, consultez la documentation du projet ShifaTech.
