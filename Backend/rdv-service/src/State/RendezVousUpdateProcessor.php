<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use App\Entity\RendezVous;

class RendezVousUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security
    ) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof RendezVous) {
            return $data;
        }

        $user = $this->security->getUser();
        $userId = $user?->getUserIdentifier();

        // Set audit fields
        $data->setUpdatedAt(new \DateTimeImmutable());
        $data->setUpdatedBy((int) $userId);

        $this->em->flush();

        return $data;
    }
}
