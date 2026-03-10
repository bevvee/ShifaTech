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
sql requetes 
-- SQL Seed Data for ShifaTech Microservices
-- Use these queries to repopulate your database after volume deletion.
-- Note: Adjust IDs if necessary based on your auto-increment state.

-- 1. AUTH SERVICE (users)
-- Password for all users: Password123
INSERT INTO users (nom, prenom, cin, email, mot_de_passe, role, sexe, statut, date_naissance, telephone, adresse, created_at) VALUES 
('Admin', 'User', 'A123456', 'admin@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uqqQ3a', 'ADMIN', 'M', 1, '1990-01-01', '0612345678', '123 Main St', NOW()),
('Dupont', 'Jean', 'D100100', 'doctor@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uqqQ3a', 'DOCTEUR', 'M', 1, '1980-05-15', '0623456789', '45 Doctor Ave', NOW()),
('Martin', 'Alice', 'M200200', 'patient@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.7uqqQ3a', 'PATIENT', 'F', 1, '1995-10-20', '0634567890', '78 Patient Rd', NOW());

-- 2. DOCTOR SERVICE (doctor_specialite)
INSERT INTO doctor_specialite (label, created_at) VALUES 
('Cardiologie', NOW()),
('Dermatologie', NOW()),
('Généraliste', NOW());

-- 3. DOCTOR SERVICE (docteur)
-- Assuming Jeand Dupont is id_user = 2
INSERT INTO docteur (id_user, numero_ordre, id_specialite, id_service, created_at) VALUES 
(2, 'ORD-2026-001', 1, 10, NOW());

-- 4. DOCTOR SERVICE (planification)
-- Assuming Doctor Dupont is id_docteur = 1
INSERT INTO planification (id_doctor, jour, heure_debut, heure_fin, pause_debut, pause_fin, created_at) VALUES 
(1, 'Lundi', '08:00:00', '17:00:00', '12:00:00', '13:00:00', NOW()),
(1, 'Mardi', '08:00:00', '17:00:00', '12:00:00', '13:00:00', NOW());

-- 5. PATIENT SERVICE (patient)
-- Assuming Alice Martin is id_user = 3
INSERT INTO patient (id_user, num_dossier, assurance, numero_assurance, statut, created_at, created_by) VALUES 
(3, 'DOS-2026-P01', 'CNOPS', 'ASS-999', 1, NOW(), 1);

-- 6. RDV SERVICE (rendez_vous)
-- Assuming Patient is id_patient = 1 and Doctor is id_docteur = 1
INSERT INTO rendez_vous (id_patient, id_docteur, date_rdv, heure_rdv, statut, created_at) VALUES 
(1, 1, '2026-04-10', '10:00:00', 'CONFIRME', NOW()),
(1, 1, '2026-04-12', '14:30:00', 'EN_ATTENTE', NOW());
