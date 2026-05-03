<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\InfirmierRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InfirmierRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/infirmier'),
        new Get(uriTemplate: '/infirmier/{id}'),
        new Post(uriTemplate: '/infirmier'),
        new Put(uriTemplate: '/infirmier/{id}'),
        new Delete(uriTemplate: '/infirmier/{id}'),
    ]
)]
class Infirmier
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_infirmier')]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $id_utilisateur = null;

    #[ORM\ManyToOne(targetEntity: InfirmierSpecialite::class, inversedBy: 'infirmiers')]
    #[ORM\JoinColumn(name: 'id_specialite', referencedColumnName: 'id_specialite', nullable: false)]
    private ?InfirmierSpecialite $id_specialite = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $deleted_at = null;

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

    public function getIdSpecialite(): ?InfirmierSpecialite
    {
        return $this->id_specialite;
    }

    public function setIdSpecialite(?InfirmierSpecialite $id_specialite): static
    {
        $this->id_specialite = $id_specialite;

        return $this;
    }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->created_at; }
    public function setCreatedAt(?\DateTimeImmutable $created_at): static { $this->created_at = $created_at; return $this; }

    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updated_at; }
    public function setUpdatedAt(?\DateTimeImmutable $updated_at): static { $this->updated_at = $updated_at; return $this; }

    public function getDeletedAt(): ?\DateTimeImmutable { return $this->deleted_at; }
    public function setDeletedAt(?\DateTimeImmutable $deleted_at): static { $this->deleted_at = $deleted_at; return $this; }
}
