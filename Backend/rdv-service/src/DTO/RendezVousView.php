<?php

namespace App\DTO;

class RendezVousView
{
    public int $id;
    public string $date;
    public string $heureDebut;
    public string $heureFin;
    public string $statut;

    public int $patientId;
    public string $patientNom;
    public string $patientPrenom;

    public int $doctorId;
    public string $doctorNom;
    public string $doctorPrenom;
}
