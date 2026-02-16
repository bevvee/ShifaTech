<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\DossierMedicalRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DossierMedicalRepository::class)]
#[ApiResource]
class DossierMedical
{
    #[ORM\Id]
    #[ORM\Column]
    #[ApiProperty(identifier: true)]
    private ?int $id_dossier = null;

    #[ORM\Column(nullable: true)]
    private ?int $id_patient = null;

    #[ORM\Column(nullable: true)]
    private ?int $id_docteur = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $date_creation = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $date_fermeture = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $diagnostic = null;

    #[ORM\Column(nullable: true)]
    private ?int $id_ordonance = null;

    public function getId(): ?int
    {
        return $this->id_dossier;
    }

    public function getIdPatient(): ?int
    {
        return $this->id_patient;
    }

    public function setIdPatient(?int $id_patient): static
    {
        $this->id_patient = $id_patient;

        return $this;
    }

    public function getIdDocteur(): ?int
    {
        return $this->id_docteur;
    }

    public function setIdDocteur(?int $id_docteur): static
    {
        $this->id_docteur = $id_docteur;

        return $this;
    }

    public function getDateCreation(): ?\DateTime
    {
        return $this->date_creation;
    }

    public function setDateCreation(?\DateTime $date_creation): static
    {
        $this->date_creation = $date_creation;

        return $this;
    }

    public function getDateFermeture(): ?\DateTime
    {
        return $this->date_fermeture;
    }

    public function setDateFermeture(?\DateTime $date_fermeture): static
    {
        $this->date_fermeture = $date_fermeture;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;

        return $this;
    }

    public function getDiagnostic(): ?string
    {
        return $this->diagnostic;
    }

    public function setDiagnostic(?string $diagnostic): static
    {
        $this->diagnostic = $diagnostic;

        return $this;
    }

    public function getIdOrdonance(): ?int
    {
        return $this->id_ordonance;
    }

    public function setIdOrdonance(?int $id_ordonance): static
    {
        $this->id_ordonance = $id_ordonance;

        return $this;
    }
}
