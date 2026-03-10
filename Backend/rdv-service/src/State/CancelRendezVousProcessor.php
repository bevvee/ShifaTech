<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use App\Entity\RendezVous;
use App\Enum\StatutEnum;

class CancelRendezVousProcessor implements ProcessorInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof RendezVous) {
            return $data;
        }

        // Reload original entity from DB
        $original = $this->em->getRepository(RendezVous::class)->find($data->getId());

        if (!$original) {
            throw new BadRequestHttpException("Rendez-vous introuvable.");
        }

        // Check original status
        if ($original->getStatut() === StatutEnum::ANNULE) {
            throw new ConflictHttpException("Ce rendez-vous est déjà annulé.");
        }

        // Prevent cancelling past RDV
        if ($original->getDateRdv() < new \DateTime()) {
            throw new ConflictHttpException("Impossible d'annuler un rendez-vous passé.");
        }

        // Update status
        $original->setStatut(StatutEnum::ANNULE);

        $this->em->flush();

        return $original;
    }
}
