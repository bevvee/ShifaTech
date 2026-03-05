<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
// use App\Processor\RendezVousProcessor;
use App\Repository\InfirmierRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: InfirmierRepository::class)]
#[ApiResource(
    shortName: 'Infirmier',
    operations: [
        new GetCollection(
            uriTemplate: '/infirmier'
        ),
        new Post(
            uriTemplate: '/infirmier',
            security: "is_granted('PUBLIC_ACCESS')"
        ),
        new Get(
            uriTemplate: '/infirmier/{id}'
        ),
        new Put(
            uriTemplate: '/infirmier/{id}'
        ),
        new Delete(
            uriTemplate: '/infirmier/{id}'
        ),
    ]
)]
class Infirmier implements UserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_infirmier')]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $id_utilisateur = null;

    #[ORM\Column]
    private ?int $id_service = null;

    #[ORM\ManyToOne(targetEntity: InfirmierSpecialite::class, inversedBy: 'infirmiers')]
    #[ORM\JoinColumn(name: 'id_specialite', referencedColumnName: 'id_specialite', nullable: false)]
    private ?InfirmierSpecialite $id_specialite = null;

    public function getId(): ?int
    {
        return $this->id;
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
    public function getUserIdentifier(): string
    {
        return (string) $this->id; // ou email
    }

    public function getRoles(): array
    {
        return ['ROLE_INFIRMIER'];
    }

    public function eraseCredentials(): void {}
}
