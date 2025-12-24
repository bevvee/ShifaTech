<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\RendezVousRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RendezVousRepository::class)]
#[ApiResource]
class RendezVous
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $id_rdv = null;

    #[ORM\Column]
    private ?int $id_patient = null;

    #[ORM\Column(nullable: true)]
    private ?int $id_docteur = null;

    #[ORM\Column]
    private ?int $id_specialite = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $date_rdv = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTime $heur_rdv = null;

    #[ORM\Column]
    private ?bool $statut = null;

    #[ORM\Column]
    private ?\DateTime $created_at = null;

    #[ORM\Column]
    private ?int $created_by = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $deleted_at = null;

    #[ORM\Column(nullable: true)]
    private ?int $deleted_by = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdRdv(): ?int
    {
        return $this->id_rdv;
    }

    public function setIdRdv(int $id_rdv): static
    {
        $this->id_rdv = $id_rdv;

        return $this;
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

    public function setIdDocteur(?int $id_docteur): static
    {
        $this->id_docteur = $id_docteur;

        return $this;
    }

    public function getIdSpecialite(): ?int
    {
        return $this->id_specialite;
    }

    public function setIdSpecialite(int $id_specialite): static
    {
        $this->id_specialite = $id_specialite;

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

    public function getHeurRdv(): ?\DateTime
    {
        return $this->heur_rdv;
    }

    public function setHeurRdv(\DateTime $heur_rdv): static
    {
        $this->heur_rdv = $heur_rdv;

        return $this;
    }

    public function isStatut(): ?bool
    {
        return $this->statut;
    }

    public function setStatut(bool $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTime $created_at): static
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

    public function getDeletedAt(): ?\DateTime
    {
        return $this->deleted_at;
    }

    public function setDeletedAt(?\DateTime $deleted_at): static
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
