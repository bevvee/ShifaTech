<?php

namespace App\Entity;

use App\Enum\StatutEnum;
use App\Repository\RendezVousRepository;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Metadata\ApiFilter;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ApiResource(
    operations: [
        new Get(
            security: "is_granted('ROLE_ADMIN') or object.getIdPatient() == user.getId() or object.getIdDocteur() == user.getId()"
        ),
        new GetCollection(
            security: "is_granted('ROLE_ADMIN') or is_granted('ROLE_DOCTOR') or is_granted('ROLE_PATIENT')"
        ),
        new Post(
            security: "is_granted('ROLE_ADMIN') or is_granted('ROLE_PATIENT')",
            processor: RendezVousProcessor::class
        ),
        new Put(
            security: "is_granted('ROLE_ADMIN') or object.getIdDocteur() == user.getId()"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
            processor: SoftDeleteProcessor::class

        ),
    ],
    paginationItemsPerPage: 10
)]

#[ApiFilter(SearchFilter::class, properties: [
    'id_patient' => 'exact',
    'id_docteur' => 'exact',
    'statut' => 'exact'
])]

#[ApiFilter(OrderFilter::class, properties: [
    'date_rdv',
    'heure_rdv',
    'created_at'
])]

#[ApiFilter(DateFilter::class, properties: [
    'date_rdv',
    'created_at'
])]

#[ORM\Entity(repositoryClass: RendezVousRepository::class)]
class RendezVous
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $id_patient = null;

    #[ORM\Column]
    private ?int $id_docteur = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $date_rdv = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTime $heure_rdv = null;

    #[ORM\Column(enumType: StatutEnum::class)]
    private ?StatutEnum $statut = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    private ?int $created_by = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\Column(nullable: true)]
    private ?int $updated_by = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $deleted_at = null;

    #[ORM\Column(nullable: true)]
    private ?int $deleted_by = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdPatient(): ?int
    {
        return $this->id_patient;
    }

    public function setIdPatient(int $id_patient): static
    {
        $this->id_patient = $id_patient;

        return $this;
    }

    public function getIdDocteur(): ?int
    {
        return $this->id_docteur;
    }

    public function setIdDocteur(int $id_docteur): static
    {
        $this->id_docteur = $id_docteur;

        return $this;
    }

    public function getDateRdv(): ?\DateTime
    {
        return $this->date_rdv;
    }

    public function setDateRdv(\DateTime $date_rdv): static
    {
        $this->date_rdv = $date_rdv;

        return $this;
    }

    public function getHeureRdv(): ?\DateTime
    {
        return $this->heure_rdv;
    }

    public function setHeureRdv(\DateTime $heure_rdv): static
    {
        $this->heure_rdv = $heure_rdv;

        return $this;
    }

    public function getStatut(): ?StatutEnum
    {
        return $this->statut;
    }

    public function setStatut(StatutEnum $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getCreatedBy(): ?int
    {
        return $this->created_by;
    }

    public function setCreatedBy(int $created_by): static
    {
        $this->created_by = $created_by;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updated_at): static
    {
        $this->updated_at = $updated_at;

        return $this;
    }

    public function getUpdatedBy(): ?int
    {
        return $this->updated_by;
    }

    public function setUpdatedBy(?int $updated_by): static
    {
        $this->updated_by = $updated_by;

        return $this;
    }

    public function getDeletedAt(): ?\DateTimeImmutable
    {
        return $this->deleted_at;
    }

    public function setDeletedAt(?\DateTimeImmutable $deleted_at): static
    {
        $this->deleted_at = $deleted_at;

        return $this;
    }

    public function getDeletedBy(): ?int
    {
        return $this->deleted_by;
    }

    public function setDeletedBy(?int $deleted_by): static
    {
        $this->deleted_by = $deleted_by;

        return $this;
    }
}
