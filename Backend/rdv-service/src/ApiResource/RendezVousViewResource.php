<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\State\RendezVousViewProvider;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/rendez-vous-view',
            provider: RendezVousViewProvider::class
        ),
        new GetCollection(
            uriTemplate: '/rendez-vous-view/current',
            provider: RendezVousViewProvider::class
        )
    ]
)]
class RendezVousViewResource
{
}