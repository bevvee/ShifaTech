<?php

namespace App\DTO;

final class RendezVousView
{
    public function __construct(
        public int $id,
        public int $idPatient,
        public int $idDocteur,
        public string $dateRdv,
        public string $heureDebut,
        public string $heureFin,
        public string $statut,
        public ?PatientSummary $patient,
        public ?DoctorSummary $docteur,
    ) {
    }
}
