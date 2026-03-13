<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Provider\PlanningProvider;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/planning/{doctorId}',
            uriVariables: ['doctorId'],
            provider: PlanningProvider::class
        ),
    ]
)]
class Planning
{
    #[ApiProperty(identifier: true)]
    public ?int $idPlan = null;
    public ?int $idDoctor = null;
    public ?string $jour = null;
    public ?string $heureDebut = null;
    public ?string $heureFin = null;
    public ?string $pauseDebut = null;
    public ?string $pauseFin = null;
    public ?string $createdAt = null;
    public ?string $updatedAt = null;
}
