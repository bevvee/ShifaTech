<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\DTO\RendezVousView;
use App\State\RendezVousViewProvider;

#[ApiResource(
    shortName: 'RendezVousView',
    operations: [
        new GetCollection(
            uriTemplate: '/rdv-view',
            provider: RendezVousViewProvider::class
        )
    ]
)]
class RendezVousViewResource extends RendezVousView
{
}
