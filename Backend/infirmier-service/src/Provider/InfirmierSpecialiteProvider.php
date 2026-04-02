<?php

namespace App\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Repository\InfirmierSpecialiteRepository;

class InfirmierSpecialiteProvider implements ProviderInterface
{
    public function __construct(
        private InfirmierSpecialiteRepository $repository
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $id = $uriVariables['id'] ?? null;

        if ($id) {
            return $this->repository->find($id);
        }

        return $this->repository->createQueryBuilder('s')
            ->where('s.deleted_at IS NULL')
            ->getQuery()
            ->getResult();
    }
}
