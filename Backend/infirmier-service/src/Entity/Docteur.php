<?php

namespace App\Entity;

use App\Repository\DocteurRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DocteurRepository::class)]
class Docteur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_docteur')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(name: 'id_utilisateur', referencedColumnName: 'id_utilisateur', nullable: false)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\OneToMany(targetEntity: DossierMedical::class, mappedBy: 'docteur')]
    private $dossiersMedicaux;

    #[ORM\Column(length: 50)]
    private ?string $numero_ordre = null;

    #[ORM\ManyToOne(targetEntity: DocteurSpecialite::class, inversedBy: 'docteurs')]
    #[ORM\JoinColumn(name: 'id_specialite', referencedColumnName: 'id_specialite')]
    private $specialite;
    #[ORM\ManyToOne(targetEntity: Service::class)]
    #[ORM\JoinColumn(name: 'id_service', referencedColumnName: 'id_service', nullable: false)]
    private ?Service $service = null;

    public function getId(): ?int { return $this->id; }
    public function getUtilisateur(): ?Utilisateur { return $this->utilisateur; }
    public function setUtilisateur(?Utilisateur $utilisateur): static { $this->utilisateur = $utilisateur; return $this; }
    public function getNumeroOrdre(): ?string { return $this->numero_ordre; }
    public function setNumeroOrdre(string $numero_ordre): static { $this->numero_ordre = $numero_ordre; return $this; }
    public function getService(): ?Service { return $this->service; }
    public function setService(?Service $service): static { $this->service = $service; return $this; }
}
