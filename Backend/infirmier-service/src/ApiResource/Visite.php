<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Processor\VisiteProcessor;
use App\Provider\VisiteProvider;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/visites',
            provider: VisiteProvider::class
        ),
        new GetCollection(
            uriTemplate: '/dossier/{idDossier}/visites',
            uriVariables: ['idDossier'],
            provider: VisiteProvider::class
        ),
        new Get(
            uriTemplate: '/visites/{id}',
            provider: VisiteProvider::class
        ),
        new Post(
            uriTemplate: '/visites',
            itemUriTemplate: '/visites/{id}',
            processor: VisiteProcessor::class
        ),
        new Put(
            uriTemplate: '/visites/{id}',
            processor: VisiteProcessor::class,
            provider: VisiteProvider::class
        ),
        new Delete(
            uriTemplate: '/visites/{id}',
            processor: VisiteProcessor::class,
            provider: VisiteProvider::class
        ),
    ]
)]
class Visite
{
    #[ApiProperty(identifier: true)]
    public ?int $id = null;
    public ?int $idDoctor = null;
    public ?int $idDossier = null;
    public ?string $status = null;
    public ?string $planTraitement = null;
    public ?string $observations = null;
    public ?string $dateCreation = null;
    public ?string $dateFermeture = null;
}
