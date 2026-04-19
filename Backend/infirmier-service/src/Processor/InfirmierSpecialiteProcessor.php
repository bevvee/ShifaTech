<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\InfirmierSpecialite;
use Doctrine\ORM\EntityManagerInterface;

class InfirmierSpecialiteProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        $method = $operation->getMethod();

        if ($method === 'POST') {
            $data->setCreatedAt(new \DateTimeImmutable());
            $this->entityManager->persist($data);
            $this->entityManager->flush();
            return $data;
        }

        if ($method === 'PUT') {
            $id = $uriVariables['id'];

            // Récupérer l'entité existante depuis la BDD
            $specialite = $this->entityManager->find(InfirmierSpecialite::class, $id);
            if (!$specialite) {
                throw new \RuntimeException('Spécialité non trouvée');
            }

            // Appliquer les modifications
            $specialite->setLabel($data->getLabel());
            $specialite->setIdService($data->getIdService());
            $specialite->setUpdatedAt(new \DateTimeImmutable());

            $this->entityManager->flush();
            return $specialite;
        }

        if ($method === 'DELETE') {
            $specialite = $this->entityManager->find(InfirmierSpecialite::class, $uriVariables['id']);
            if ($specialite) {
                $specialite->setDeletedAt(new \DateTimeImmutable());
                $this->entityManager->flush();
            }
            return null;
        }

        return $data;
    }
}
