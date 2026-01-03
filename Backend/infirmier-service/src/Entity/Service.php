<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ServiceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ServiceRepository::class)]
#[ApiResource]
class Service
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id_service;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $label = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;


    /**
     * @var Collection<int, Infirmier>
     */
    #[ORM\OneToMany(targetEntity: Infirmier::class, mappedBy: 'id_service')]
    private Collection $infirmiers;



    public function __construct()
    {
        $this->infirmiers = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id_service;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label): static
    {
        $this->label = $label;

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

    /**
     * @return Collection<int, Infirmier>
     */
    public function getInfirmiers(): Collection
    {
        return $this->infirmiers;
    }

    public function addInfirmier(Infirmier $infirmier): static
    {
        if (!$this->infirmiers->contains($infirmier)) {
            $this->infirmiers->add($infirmier);
            $infirmier->setIdService($this);
        }

        return $this;
    }

    public function removeInfirmier(Infirmier $infirmier): static
    {
        if ($this->infirmiers->removeElement($infirmier)) {
            if ($infirmier->getIdService() === $this) {
                $infirmier->setIdService(null);
            }
        }

        return $this;
    }

}
