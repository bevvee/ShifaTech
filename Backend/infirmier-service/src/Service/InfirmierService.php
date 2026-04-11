<?php

namespace App\Service;

use App\Dto\InfirmierDetailDto;
use App\Repository\InfirmierRepository;

class InfirmierService
{
    public function __construct(
        private InfirmierRepository $infirmierRepository,
        private AuthServiceClient $authServiceClient
    ) {}

    public function getInfirmierDetail(int $id, string $authHeader): ?InfirmierDetailDto
    {
        $infirmier = $this->infirmierRepository->find($id);
        if (!$infirmier) return null;

        $dto = new InfirmierDetailDto();
        $dto->idInfirmier   = $infirmier->getId();
        $dto->idUtilisateur = $infirmier->getIdUtilisateur();
        $dto->idService     = $infirmier->getIdService();
        $dto->specialite    = $infirmier->getIdSpecialite()?->getLabel();

        // Récupérer les infos user depuis auth-service
        $user = $this->authServiceClient->getUserById($infirmier->getIdUtilisateur(), $authHeader);
        if ($user) {
            $dto->nom           = $user['nom'] ?? null;
            $dto->prenom        = $user['prenom'] ?? null;
            $dto->email         = $user['email'] ?? null;
            $dto->cin           = $user['cin'] ?? null;
            $dto->telephone     = $user['telephone'] ?? null;
            $dto->adresse       = $user['adresse'] ?? null;
            $dto->sexe          = $user['sexe'] ?? null;
            $dto->dateNaissance = $user['dateNaissance'] ?? null;
        }

        return $dto;
    }

    public function getAllInfirmiersDetail(string $authHeader): array
    {
        $infirmiers = $this->infirmierRepository->findAll();
        $result = [];

        foreach ($infirmiers as $infirmier) {
            $result[] = $this->getInfirmierDetail($infirmier->getId(), $authHeader);
        }

        return array_filter($result);
    }
}
