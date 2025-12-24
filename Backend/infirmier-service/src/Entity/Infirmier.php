<?php

namespace App\Entity;

use App\Repository\InfirmierRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InfirmierRepository::class)]
class Infirmier
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_infirmier')]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: Utilisateur::class, inversedBy: 'infirmier')]
    #[ORM\JoinColumn(name: 'id_utilisateur', referencedColumnName: 'id_utilisateur', nullable: false, unique: true)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\ManyToOne(targetEntity: Service::class, inversedBy: 'infirmiers')]
    #[ORM\JoinColumn(name: 'id_service', referencedColumnName: 'id_service', nullable: true)]
    private ?Service $service = null;

    #[ORM\ManyToOne(targetEntity: InfirmierSpecialite::class, inversedBy: 'infirmiers')]
    #[ORM\JoinColumn(name: 'id_infirmierSp', referencedColumnName: 'id_infirmierSp', nullable: true)]
    private ?InfirmierSpecialite $specialite = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): static
    {
        // Mettre à jour la relation inverse
        if ($utilisateur !== null && $utilisateur->getInfirmier() !== $this) {
            $utilisateur->setInfirmier($this);
        }
        $this->utilisateur = $utilisateur;
        return $this;
    }

    public function getService(): ?Service
    {
        return $this->service;
    }

    public function setService(?Service $service): static
    {
        $this->service = $service;
        return $this;
    }

    public function getSpecialite(): ?InfirmierSpecialite
    {
        return $this->specialite;
    }

    public function setSpecialite(?InfirmierSpecialite $specialite): static
    {
        $this->specialite = $specialite;
        return $this;
    }
}
