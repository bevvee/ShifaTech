<?php

namespace App\Dto;

class RendezVousResponse
{
    public int $id;
    public int $patientId;
    public string $date;
    public string $service;
    public string $statut;
    public ?string $notes;
    public \DateTimeImmutable $createdAt;

//    public function __construct(array $data)
//    {
//        $this->id = $data['id'];
//        $this->patientId = $data['patient_id'];
//        $this->date = $data['date'];
//        $this->service = $data['service'];
//        $this->statut = $data['statut'] ?? 'planifie';
//        $this->notes = $data['notes'] ?? null;
//        $this->createdAt = new \DateTimeImmutable($data['created_at'] ?? 'now');
//    }
}
