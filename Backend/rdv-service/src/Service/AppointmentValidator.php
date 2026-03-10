<?php

namespace App\Service;

use App\Entity\RendezVous;
use App\Repository\RendezVousRepository;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class AppointmentValidator
{
    public function __construct(private RendezVousRepository $repository) {}

    public function validate(RendezVous $rdv): void
    {
        // 1️⃣ Check required patient
        if (!$rdv->getIdPatient()) {
            throw new BadRequestHttpException('Patient requis.');
        }

        // 2️⃣ Check time range
        if ($rdv->getHeureFin() <= $rdv->getHeureDebut()) {
            throw new BadRequestHttpException(
                "L'heure de fin doit être après l'heure de début."
            );
        }

        // 3️⃣ Clinic hours
        $clinicStart = new \DateTime('08:00');
        $clinicEnd = new \DateTime('18:00');

        if ($rdv->getHeureDebut() < $clinicStart || $rdv->getHeureFin() > $clinicEnd) {
            throw new BadRequestHttpException(
                "Le rendez-vous doit être entre 08:00 et 18:00."
            );
        }

        // 4️⃣ Doctor busy
        if ($this->repository->doctorHasAppointment(
            $rdv->getIdDocteur(),
            $rdv->getDateRdv(),
            $rdv->getHeureDebut(),
            $rdv->getHeureFin()
        )) {
            throw new ConflictHttpException(
                'Le docteur a déjà un rendez-vous à cette heure.'
            );
        }

        // 5️⃣ Doctor max/day
        $doctorCount = $this->repository->countDoctorAppointmentsForDay(
            $rdv->getIdDocteur(),
            $rdv->getDateRdv()
        );

        if ($doctorCount >= 20) {
            throw new ConflictHttpException(
                'Le docteur a atteint un maximum de 20 rendez-vous pour ce jour.'
            );
        }

        // 6️⃣ Patient max/day
        $patientCount = $this->repository->countPatientAppointmentsForDay(
            $rdv->getIdPatient(),
            $rdv->getDateRdv()
        );

        if ($patientCount >= 1) {
            throw new ConflictHttpException(
                'Le patient a déjà un rendez-vous pour ce jour.'
            );
        }
    }
}
