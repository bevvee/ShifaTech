<?php

namespace App\Entity;


use App\Processor\InfirmierProcessor;
use App\Repository\InfirmierRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: InfirmierRepository::class)]
class Infirmier implements UserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_infirmier')]
    private ?int $id = null;

    #[ORM\Column(name: 'id_utilisateur')]
    private ?int $id_utilisateur = null;

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
        return (string) $this->id;
    }

    public function getRoles(): array
    {
        return ['ROLE_INFIRMIER'];
    }

    public function eraseCredentials(): void {}
}
