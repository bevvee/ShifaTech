<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\AfficheRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AfficheRepository::class)]
#[ApiResource]
class Affiche
{
    #[ORM\Id]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $id_patient = null;

    #[ORM\Column(nullable: true)]
    private ?int $id_docteur = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $date_creation = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }
}
