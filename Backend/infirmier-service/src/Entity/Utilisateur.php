<?php

namespace App\Entity;

use App\Enum\RoleUtilisateur;
use App\Enum\SexeUtilisateur;
use App\Repository\UtilisateurRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
class Utilisateur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_utilisateur')]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nom = null;

    #[ORM\Column(length: 100)]
    private ?string $prenom = null;

    #[ORM\Column(length: 15, unique: true)]
    private ?string $cin = null;

    #[ORM\Column(length: 150, unique: true)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $mot_de_passe = null;

    #[ORM\Column(type: Types::STRING, length: 20, enumType: RoleUtilisateur::class)]
    private ?RoleUtilisateur $role = null;

    #[ORM\Column(type: Types::STRING, length: 1, enumType: SexeUtilisateur::class)]
    private ?SexeUtilisateur $sexe = null;

    #[ORM\Column(nullable: true)]
    private ?bool $statut = false;

    #[ORM\OneToOne(targetEntity: Infirmier::class, mappedBy: 'utilisateur')]
    private $infirmier;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    private ?int $created_by = 0;

    public function __construct()
    {
        $this->created_at = new \DateTimeImmutable();
        $this->statut = true;
    }

    // GETTERS/SETTERS DE BASE
    public function getId(): ?int { return $this->id; }
    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }
    public function getPrenom(): ?string { return $this->prenom; }
    public function setPrenom(string $prenom): static { $this->prenom = $prenom; return $this; }
    public function getCin(): ?string { return $this->cin; }
    public function setCin(string $cin): static { $this->cin = $cin; return $this; }
    public function getEmail(): ?string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }
    public function getMotDePasse(): ?string { return $this->mot_de_passe; }
    public function setMotDePasse(string $mot_de_passe): static { $this->mot_de_passe = $mot_de_passe; return $this; }
    public function getRole(): ?RoleUtilisateur { return $this->role; }
    public function setRole(RoleUtilisateur $role): static
    {
        $this->role = $role;
        return $this;
    }
    public function getSexe(): ?SexeUtilisateur { return $this->sexe; }
    public function setSexe(SexeUtilisateur $sexe): static
    {
        $this->sexe = $sexe;
        return $this;
    }
}
