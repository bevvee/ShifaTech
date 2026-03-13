<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use App\Entity\RendezVous;

class SoftDeleteProcessor implements ProcessorInterface
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

        $data->setDeletedAt(new \DateTimeImmutable());
        $data->setDeletedBy((int) $userId);

        $this->em->persist($data);
        $this->em->flush();

        return null; // DELETE should return 204
    }
}
