<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\RendezVous;
use App\Repository\RendezVousRepository;

class RendezVousProcessor implements ProcessorInterface
{
    public function __construct(
        private RendezVousRepository $repository
    ) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof RendezVous) {
            return $data;
        }

        // 1️⃣ Prevent double booking
        if ($this->repository->doctorHasAppointment(
            $data->getIdDocteur(),
            $data->getDateRdv(),
            $data->getHeureRdv()
        )) {
            throw new \RuntimeException('Doctor already has appointment at this time.');
        }

        // 2️⃣ Max 20 per day
        $count = $this->repository->countDoctorAppointmentsForDay(
            $data->getIdDocteur(),
            $data->getDateRdv()
        );

        if ($count >= 20) {
            throw new \RuntimeException('Doctor reached maximum 20 appointments for this day.');
        }

        return $data;
    }
}
