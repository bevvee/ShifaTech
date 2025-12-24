<?php

namespace App\Entity;

use App\Repository\DossierMedicalRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DossierMedicalRepository::class)]
class DossierMedical
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_rdv')]
    private ?int $id_rdv = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $dateCreation = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $dateFermeture = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $diagnostic = null;

    #[ORM\ManyToOne(targetEntity: Patient::class, inversedBy: 'dossiersMedicaux')]
    #[ORM\JoinColumn(name: 'id_patient', referencedColumnName: 'id_patient', nullable: false)]
    private ?Patient $patient = null;

    #[ORM\ManyToOne(targetEntity: Docteur::class, inversedBy: 'dossiersMedicaux')]
    #[ORM\JoinColumn(name: 'id_docteur', referencedColumnName: 'id_docteur')]
    private ?Docteur $docteur;
    public function __construct()
    {
        $this->dateCreation = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id_rdv;
    }

    public function getDateCreation(): ?\DateTimeImmutable
    {
        return $this->dateCreation;
    }

    public function setDateCreation(\DateTimeImmutable $dateCreation): static
    {
        $this->dateCreation = $dateCreation;
        return $this;
    }

    public function getDateFermeture(): ?\DateTimeImmutable
    {
        return $this->dateFermeture;
    }

    public function setDateFermeture(?\DateTimeImmutable $dateFermeture): static
    {
        $this->dateFermeture = $dateFermeture;
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
}
