# Guide de Test - Doctor Service

Ce guide vous explique comment tester les APIs du Doctor Service avec Postman.

## 1. Pré-requis : Récupérer un Token JWT

Le service est sécurisé. Vous ne pouvez rien faire sans un **Token** (jeton de connexion) valide.
Ce token est délivré par votre **Auth Service**.

1.  Lancez votre **Auth Service** (sur le port 8083 par exemple).
2.  Lancez **Postman**.
3.  Faites une requête `POST` vers votre Auth Service pour vous connecter (Login) :

🚀 **Étape 1 : Enregistrer un nouvel utilisateur**
Vous devez d'abord créer le compte. Utilisez cette requête dans Postman :

**Méthode** : `POST`  
**URL** : `http://localhost:8082/auth/register`  
**Body** (raw JSON) :

```json
{
    "nom": "Niss",
    "prenom": "User",
    "cin": "AB123456",
    "email": "niss@gmail.com",
    "password": "Password123",
    "passwordConfirmation": "Password123",
    "role": "DOCTEUR",
    "sexe": "M",
    "dateNaissance": "1990-01-01",
    "telephone": "0600000000",
    "adresse": "Casablanca, Maroc"
}
```
🔑 **Étape 2 : Se connecter**
Une fois que vous avez reçu un message de succès pour le "Register", faites le Login :

**Méthode** : `POST`  
**URL** : `http://localhost:8082/auth/login`  
**Body** (raw JSON) :

```json
{
    "email": "niss@gmail.com",
    "password": "Password123"
}
```
   
4.  La réponse contiendra un `accessToken` (une longue chaîne de caractères qui commence souvent par `eyJ...`).
5.  **Copiez ce token**. C'est votre "Passeport".

## 2. Importer la Collection Postman

1.  Ouvrez Postman.
2.  En haut à gauche, cliquez sur le bouton **"Import"**.
3.  Choisissez **"File"** > **"Upload Files"**.
4.  Sélectionnez le fichier `DoctorService_Postman_Collection.json` qui se trouve dans ce dossier.
5.  Une nouvelle "Collection" nommée **"Doctor Service API"** apparaît à gauche.

## 3. Configurer le Token (Variable)

Pour ne pas copier-coller le token dans chaque requête, nous utilisons une variable.

1.  Cliquez sur la collection **"Doctor Service API"** (le dossier racine à gauche).
2.  Allez dans l'onglet **"Variables"** (au milieu de l'écran).
3.  Cherchez la ligne `jwt_token`.
4.  Dans la colonne **"Current Value"**, collez le token que vous avez copié à l'étape 1.
5.  **Sauvegardez** (Ctrl+S).

## 4. Lancer les Tests

1.  Ouvrez une requête (ex: `8. Health Check`).
2.  Cliquez sur **"Send"**.
3.  Vous devriez voir un statut **200 OK**.

### Si vous avez une erreur 403 Forbidden
*   C'est que votre Token est invalide, expiré, ou mal copié dans la variable `jwt_token`.
*   Assurez-vous d'avoir sauvegardé la collection après avoir mis le token.
