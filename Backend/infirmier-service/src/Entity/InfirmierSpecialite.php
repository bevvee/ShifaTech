<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\InfirmierSpecialiteRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;

#[ORM\Entity(repositoryClass: InfirmierSpecialiteRepository::class)]
#[ApiResource
(
    operations: [
        new GetCollection(
            uriTemplate: '/infirmier_specialites',
            security: "is_granted('ROLE_ADMIN') or is_granted('ROLE_INFIRMIER')"

        ),
        new Post(
            uriTemplate: '/infirmier_specialites',
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Get(
            uriTemplate: '/infirmier_specialites/{id}',
            security: "is_granted('ROLE_ADMIN') or is_granted('ROLE_INFIRMIER')"

        ),
        new Put(
            uriTemplate: '/infirmier_specialites/{id}',
            security: "is_granted('ROLE_ADMIN')"
        ),
        new Delete(
            uriTemplate: '/infirmier_specialites/{id}',
            security: "is_granted('ROLE_ADMIN')"
        ),
        ]
)]
class InfirmierSpecialite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_specialite')]
    private ?int $id = null;

    #[ORM\OneToMany(targetEntity: Infirmier::class, mappedBy: 'id_specialite')]
    private Collection $infirmiers;

    #[ORM\Column(length: 50)]
    private ?string $label = null;
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
}
