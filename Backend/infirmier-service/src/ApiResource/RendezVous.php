<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Processor\RendezVousProcessor;
use App\Provider\RendezVousProvider;

#[ApiResource(
    operations: [
        new GetCollection(provider: RendezVousProvider::class),
        new Get(provider: RendezVousProvider::class),
        new Post(processor: RendezVousProcessor::class),
        new Patch(processor: RendezVousProcessor::class),
        new Delete(processor: RendezVousProcessor::class),
    ]
)]
class RendezVous
{
    public ?int $id_patient = null;
    public ?int $id_docteur = null;
    public ?string $date_rdv = null;
    public ?string $heure_rdv = null;
    public ?string $statut = 'EN_ATTENTE';
}
