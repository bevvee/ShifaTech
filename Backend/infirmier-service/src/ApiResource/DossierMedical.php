<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Processor\DossierMedicalProcessor;
use App\Provider\DossierMedicalProvider;
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/dossiers',
            provider: DossierMedicalProvider::class
        ),
        new Get(
            uriTemplate: '/patients/{idPatient}/dossier-medical',
            uriVariables: ['idPatient'],
            provider: DossierMedicalProvider::class
        ),
        new Post(
            uriTemplate: '/dossier-medical',
            itemUriTemplate: '/patients/{idPatient}/dossier-medical',
            processor: DossierMedicalProcessor::class
        ),
        new Put(
            uriTemplate: '/patients/{idPatient}/dossier-medical',
            uriVariables: ['idPatient'],
            processor: DossierMedicalProcessor::class,
            provider: DossierMedicalProvider::class
        ),
        new Delete(
            uriTemplate: '/patients/{idPatient}/dossier-medical',
            uriVariables: ['idPatient'],
            processor: DossierMedicalProcessor::class,
            provider: DossierMedicalProvider::class
        ),
    ]
)]
class DossierMedical
{
    #[ApiProperty(identifier: true)]
    public ?int $idPatient = null;

    public ?int $idDossier = null;
    public ?string $status = null;
    public ?float $poids = null;
    public ?float $taille = null;
    public ?string $groupeSanguin = null;
    public ?string $antecedentsMedicaux = null;
    public ?string $allergies = null;
    public ?string $pathologiesChroniques = null;
    public ?string $notes = null;
    public ?string $diagnostic = null;
}
