<?php

namespace App\Dto;

class InfirmierDetailDto
{
    public ?int $idInfirmier = null;
    public ?int $idUtilisateur = null;
    public ?int $idService = null;
    public ?string $specialite = null;

    // Infos user depuis auth-service
    public ?string $nom = null;
    public ?string $prenom = null;
    public ?string $email = null;
    public ?string $cin = null;
    public ?string $telephone = null;
    public ?string $adresse = null;
    public ?string $sexe = null;
    public ?string $dateNaissance = null;
}
