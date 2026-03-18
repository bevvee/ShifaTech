<?php

namespace App\ApiResource;

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
        new GetCollection(
            uriTemplate: '/infirmier',
            security: "is_granted('ROLE_ADMIN')",
            provider: InfirmierProvider::class
        ),
        new Post(
            uriTemplate: '/infirmier',
            security: "is_granted('ROLE_ADMIN')",
            processor: InfirmierProcessor::class
        ),
        new Get(
            uriTemplate: '/infirmier/{id}',
            security: "is_granted('ROLE_ADMIN')",
            provider: InfirmierProvider::class
        ),
        new Put(
            uriTemplate: '/infirmier/{id}',
            security: "is_granted('ROLE_ADMIN')",
            processor: InfirmierProcessor::class,
            provider: InfirmierProvider::class
        ),
        new Delete(
            uriTemplate: '/infirmier/{id}',
            security: "is_granted('ROLE_ADMIN')",
            processor: InfirmierProcessor::class,
            provider: InfirmierProvider::class
        ),
    ]
)]
class InfirmierResource
{
    #[ApiProperty(identifier: true)]
    public ?int $id = null;
    public ?int $id_utilisateur = null;
    public ?string $id_specialite = null;
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
