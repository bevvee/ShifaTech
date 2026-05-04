# ShifaTech - Admin Service (Notification Engine)

Ce service gère l'envoi des e-mails et des notifications en temps réel du projet.

## 🚀 Guide de configuration rapide

Le service utilise des variables d'environnement pour sécuriser les identifiants de connexion.

### 1. Préparer le fichier `.env`
À la racine du projet (ou dans le dossier de configuration), assurez-vous que votre fichier `.env` contient les identifiants d'un compte **ADMIN** valide présent dans votre base de données :

```env
AUTH_EMAIL=votre-email-admin@shifatech.com
AUTH_PASSWORD=votre-mot-de-passe
```

### 2. Lancement du service
Une fois le fichier `.env` configuré, lancez le service :

```bash
mvn clean package -DskipTests
docker-compose up --build admin-service
```

> **Note** : Le service récupère automatiquement ces valeurs pour s'authentifier auprès de l'Auth-Service et envoyer les notifications.

## 📧 Visualisation des e-mails
Les e-mails envoyés sont interceptés par **MailHog** pour vos tests locaux.
