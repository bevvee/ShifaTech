<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\InfirmierSpecialiteRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InfirmierSpecialiteRepository::class)]
#[ApiResource]
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
