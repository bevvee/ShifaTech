<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Processor\InfirmierProcessor;
use App\Provider\InfirmierProvider;

#[ApiResource(
    shortName: 'Infirmier',
    operations: [
        new GetCollection(uriTemplate: '/infirmier'),
        new Post(uriTemplate: '/infirmier'),
        new Get(uriTemplate: '/infirmier/{id}'),
        new Put(uriTemplate: '/infirmier/{id}'),
        new Delete(uriTemplate: '/infirmier/{id}'),
    ],
    provider: InfirmierProvider::class,
    processor: InfirmierProcessor::class,
)]
class InfirmierResource
{
    #[ApiProperty(identifier: true)]
    public ?int $id = null;

    public ?int $id_utilisateur = null;
    public int|string|null $id_specialite = null;
    public int|string|null $id_service = null;
    public ?string $nom = null;
    public ?string $prenom = null;
    public ?string $cin = null;
    public ?string $email = null;
    public ?string $sexe = null;
    public ?bool $statut = null;
    public ?string $dateNaissance = null;
    public ?string $telephone = null;
    public ?string $adresse = null;
}
