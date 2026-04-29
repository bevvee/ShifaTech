<?php

namespace App\DTO;

class DoctorSummary
{
    public ?int $id = null;
    public ?int $userId = null;
    public ?string $nom = null;
    public ?string $prenom = null;

    /**
     * Accepts either a wrapped response (e.g. ['data' => [...]]) or a flat payload.
     */
    public static function fromApiPayload(array $payload): self
    {
        $data = $payload['data'] ?? $payload;

        $dto = new self();
        $dto->id = isset($data['id']) ? (int) $data['id'] : null;
        $dto->userId = isset($data['idUser']) ? (int) $data['idUser'] : (isset($data['userId']) ? (int) $data['userId'] : null);
        $dto->nom = isset($data['nom']) ? (string) $data['nom'] : null;
        $dto->prenom = isset($data['prenom']) ? (string) $data['prenom'] : null;

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
