<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\RendezVous;

class SoftDeleteProcessor implements ProcessorInterface
{
    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof RendezVous) {
            return $data;
        }

        $data->setDeletedAt(new \DateTimeImmutable());

        return $data;
    }
}
