<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\ApiProperty;
use App\Processor\PatientProcessor;
#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/patients/register',
            security: "is_granted('ROLE_INFIRMIER')",
            processor: PatientProcessor::class
        ),
    ]
)]
class Patient
{
    #[ApiProperty(identifier: true)]
    public ?int $id = null;
    public ?string $nom = null;
    public ?string $prenom = null;
    public ?string $cin = null;
    public ?string $email = null;
    public ?string $password = null;
    public ?string $password_confirmation = null;
    public ?string $role = 'PATIENT';
    public ?string $sexe = null;
    public ?string $date_naissance = null;
    public ?string $telephone = null;
    public ?string $adresse = null;
}
