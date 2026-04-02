<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Provider\InfirmierSpecialiteProvider;
use App\Repository\InfirmierSpecialiteRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Processor\InfirmierSpecialiteProcessor;

#[ORM\Entity(repositoryClass: InfirmierSpecialiteRepository::class)]
#[ApiResource
(
    operations: [
        new GetCollection(
            uriTemplate: '/infirmier_specialites',
            security: "is_granted('ROLE_ADMIN') or is_granted('ROLE_INFIRMIER')",
            provider: InfirmierSpecialiteProvider::class
        ),
        new Get(
            uriTemplate: '/infirmier_specialites/{id}',
            security: "is_granted('ROLE_ADMIN') or is_granted('ROLE_INFIRMIER')",
            provider: InfirmierSpecialiteProvider::class
        ),
        new Post(
            uriTemplate: '/infirmier_specialites',
            security: "is_granted('ROLE_ADMIN')",
            processor: InfirmierSpecialiteProcessor::class
        ),
        new Put(
            uriTemplate: '/infirmier_specialites/{id}',
            security: "is_granted('ROLE_ADMIN')",
            processor: InfirmierSpecialiteProcessor::class
        ),
        new Delete(
            uriTemplate: '/infirmier_specialites/{id}',
            security: "is_granted('ROLE_ADMIN')",
            processor: InfirmierSpecialiteProcessor::class
        ),
        ]
)]
class InfirmierSpecialite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_specialite')]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $id_service = null;

    #[ORM\OneToMany(targetEntity: Infirmier::class, mappedBy: 'id_specialite')]
    private Collection $infirmiers;

    #[ORM\Column(length: 50)]
    private ?string $label = null;
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $deleted_at = null;

    public function __construct()
    {
        $this -> infirmiers = new ArrayCollection();
    }
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;

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

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->created_at; }
    public function setCreatedAt(?\DateTimeImmutable $created_at): static { $this->created_at = $created_at; return $this; }

    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updated_at; }
    public function setUpdatedAt(?\DateTimeImmutable $updated_at): static { $this->updated_at = $updated_at; return $this; }

    public function getDeletedAt(): ?\DateTimeImmutable { return $this->deleted_at; }
    public function setDeletedAt(?\DateTimeImmutable $deleted_at): static { $this->deleted_at = $deleted_at; return $this; }
}
