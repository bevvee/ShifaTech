<?php

namespace App\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\InfirmierResource;
use App\Repository\InfirmierRepository;

class InfirmierProvider implements ProviderInterface
{
    public function __construct(
        private InfirmierRepository $infirmierRepository
    ) {}

    public function provide(
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ): object|array|null {

        $id = $uriVariables['id'] ?? null;
        $method = $operation->getMethod();

        if (in_array($method, ['PUT', 'DELETE']) && $id) {
            $resource = new InfirmierResource();
            $resource->id = $id;
            return $resource;
        }

        if ($id) {
            $infirmier = $this->infirmierRepository->find($id);
            if (!$infirmier) return null;
            return $this->mapToResource($infirmier);
        }

        return array_map(
            fn($infirmier) => $this->mapToResource($infirmier),
            $this->infirmierRepository->findAll()
        );
    }

    private function mapToResource(\App\Entity\Infirmier $infirmier): InfirmierResource
    {
        $resource = new InfirmierResource();
        $resource->id = $infirmier->getId();
        $resource->id_utilisateur = $infirmier->getIdUtilisateur();
        $resource->id_service = $infirmier->getIdService();
        $resource->id_specialite = $infirmier->getIdSpecialite()?->getId();
        return $resource;
    }
}
