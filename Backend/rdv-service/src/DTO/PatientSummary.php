<?php

namespace App\DTO;

class PatientSummary
{
    public ?int $idPatient = null;
    public ?int $idUser = null;

    public ?string $nom = null;
    public ?string $prenom = null;
    public ?string $email = null;
    public ?string $telephone = null;

    /**
     * Accepts either a wrapped response (e.g. ['data' => [...]]) or a flat payload.
     */
    public static function fromApiPayload(array $payload): self
    {
        $data = $payload['data'] ?? $payload;

        $dto = new self();

        // patient-service uses idPatient/idUser (Java Long)
        $dto->idPatient = isset($data['idPatient']) ? (int) $data['idPatient'] : (isset($data['patientId']) ? (int) $data['patientId'] : null);
        $dto->idUser = isset($data['idUser']) ? (int) $data['idUser'] : (isset($data['userId']) ? (int) $data['userId'] : null);

        $dto->nom = isset($data['nom']) ? (string) $data['nom'] : null;
        $dto->prenom = isset($data['prenom']) ? (string) $data['prenom'] : null;
        $dto->email = isset($data['email']) ? (string) $data['email'] : null;
        $dto->telephone = isset($data['telephone']) ? (string) $data['telephone'] : null;

        return $dto;
    }

    public function getFullName(): ?string
    {
        if (!$this->prenom || !$this->nom) {
            return null;
        }

        return $this->prenom.' '.$this->nom;
    }
}
