<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use App\Entity\RendezVous;
use App\Repository\RendezVousRepository;

class RendezVousProcessor implements ProcessorInterface
{
    public function __construct(
        private RendezVousRepository $repository,
        private EntityManagerInterface $em,
        private Security $security
    ) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof RendezVous) {
            return $data;
        }

        // ✅ Get userId from JWT safely
        $user = $this->security->getUser();
        $userId = $user?->getUserIdentifier();

        // Prevent double booking
        if ($this->repository->doctorHasAppointment(
            $data->getIdDocteur(),
            $data->getDateRdv(),
            $data->getHeureRdv()
        )) {
            throw new \RuntimeException('Doctor already has appointment at this time.');
        }

        // Max 20 per day
        $count = $this->repository->countDoctorAppointmentsForDay(
            $data->getIdDocteur(),
            $data->getDateRdv()
        );

        if ($count >= 20) {
            throw new \RuntimeException('Doctor reached maximum 20 appointments for this day.');
        }

        // Audit fields
        $data->setCreatedAt(new \DateTimeImmutable());
        $data->setCreatedBy((int) $userId);

        $this->em->persist($data);
        $this->em->flush();

        return $data;
    }
}
