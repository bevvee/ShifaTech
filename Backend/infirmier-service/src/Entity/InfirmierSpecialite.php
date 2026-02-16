<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\InfirmierSpecialiteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InfirmierSpecialiteRepository::class)]
#[ApiResource]
class InfirmierSpecialite
{
    #[ApiProperty(identifier: true)]
    #[ORM\Id]
    #[ORM\Column(name: 'id_specialite', type: 'integer')]
    private ?int $id_specialite = null;

    #[ORM\OneToMany(targetEntity: Infirmier::class, mappedBy: 'id_specialite')]
    private Collection $infirmiers;

    #[ORM\OneToMany(targetEntity: Service::class, mappedBy: 'id_service')]
    private Collection $service_infirmiers;
    #[ORM\Column(length: 50)]
    private ?string $label = null;

    public function __construct()
    {
        $this->service_infirmiers = new ArrayCollection();
    }
    public function getId(): ?int
    {
        return $this->id_specialite;
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
