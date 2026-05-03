<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Processor\InfirmierSpecialiteProcessor;
use App\Provider\InfirmierSpecialiteProvider;


#[ApiResource(
    shortName: 'InfirmierSpecialite',
    operations: [
        new GetCollection(
            uriTemplate: '/infirmier_specialites',
            security: "is_granted('ROLE_ADMIN') or is_granted('ROLE_INFIRMIER')",
            provider: InfirmierSpecialiteProvider::class
        ),
        new Get(
            uriTemplate: '/infirmier_specialites/{id}',
            security: "is_granted('ROLE_ADMIN') or is_granted('ROLE_INFIRMIER')",
            provider: InfirmierSpecialiteProvider::class
        ),
        new Post(
            uriTemplate: '/infirmier_specialites',
            security: "is_granted('ROLE_ADMIN')",
            processor: InfirmierSpecialiteProcessor::class
        ),
        new Put(
            uriTemplate: '/infirmier_specialites/{id}',
            security: "is_granted('ROLE_ADMIN')",
            processor: InfirmierSpecialiteProcessor::class
        ),
        new Delete(
            uriTemplate: '/infirmier_specialites/{id}',
            security: "is_granted('ROLE_ADMIN')",
            processor: InfirmierSpecialiteProcessor::class
        ),
    ],
)]
class InfirmierSpecialiteResource
{
    #[ApiProperty(identifier: true)]
    public ?int $id = null;

    public ?int $idService = null;

    public ?string $label = null;
}
