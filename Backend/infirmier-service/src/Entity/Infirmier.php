<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\InfirmierRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InfirmierRepository::class)]
#[ApiResource]
class Infirmier
{
    #[ApiProperty(identifier: true)]
    #[ORM\Id]
    #[ORM\Column(name: 'id_infirmier', type:'integer')]
    private ?int $id_infirmier = null;

    #[ORM\Column]
    private ?int $id_utilisateur = null;

    #[ORM\Column]
    private ?int $id_service = null;

    #[ORM\ManyToOne(targetEntity: InfirmierSpecialite::class,cascade: ['persist'])]
    #[ORM\JoinColumn(name: 'id_specialite', referencedColumnName: 'id_specialite', nullable: false)]
    #[ApiProperty(
        readableLink: false,
        writableLink: true 
    )]
    private ?InfirmierSpecialite $id_specialite = null;

    public function getId(): ?int
    {
        return $this->id_infirmier;
    }

    public function getIdUtilisateur(): ?int
    {
        return $this->id_utilisateur;
    }

    public function setIdUtilisateur(?int $id_utilisateur): static
    {
        $this->id_utilisateur = $id_utilisateur;

        return $this;
    }

    public function getIdService(): ?int
    {
        return $this->id_service;
    }

    public function setIdService(?int $id_service): static
    {
        $this->id_service = $id_service;

        return $this;
    }

    public function getIdSpecialite(): ?InfirmierSpecialite
    {
        return $this->id_specialite;
    }

    public function setIdSpecialite(?InfirmierSpecialite $id_specialite): static
    {
        $this->id_specialite = $id_specialite;

        return $this;
    }
}
