<?php

namespace App\Entity;

use App\Repository\DocteurSpecialiteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DocteurSpecialiteRepository::class)]
class DocteurSpecialite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_specialite', type: 'integer')]
    private $id_specialite;

    #[ORM\Column(length: 50)]
    private ?string $label = null;

    #[ORM\OneToMany(targetEntity: Docteur::class, mappedBy: 'specialite')]
    private Collection $docteurs;

    public function __construct()
    {
        $this->docteurs = new \Doctrine\Common\Collections\ArrayCollection();
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
