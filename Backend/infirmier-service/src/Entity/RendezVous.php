<?php

namespace App\Entity;

use App\Enum\StatutRendezVous;
use App\Repository\RendezVousRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RendezVousRepository::class)]
class RendezVous
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_rdv')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Patient::class)]
    #[ORM\JoinColumn(name: 'id_patient', referencedColumnName: 'id_patient', nullable: false)]
    private ?Patient $patient = null;

    #[ORM\ManyToOne(targetEntity: Docteur::class)]
    #[ORM\JoinColumn(name: 'id_docteur', referencedColumnName: 'id_docteur', nullable: false)]
    private ?Docteur $docteur = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $date_rdv = null;

    #[ORM\Column(name: 'statut', type: Types::STRING, length: 20, enumType: StatutRendezVous::class)]
    private ?StatutRendezVous $statut = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    private ?int $created_by = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updated_at = null;

    #[ORM\Column(nullable: true)]
    private ?int $updated_by = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $deleted_at = null;

    #[ORM\Column(nullable: true)]
    private ?int $deleted_by = null;

    #[ORM\Column(name: 'heur_rdv', type: 'time', nullable: true)]
    private ?\DateTimeInterface $heur_rdv = null;

    public function __construct()
    {
        $this->created_at = new \DateTimeImmutable();
        $this->statut = StatutRendezVous::EN_ATTENTE;
    }

    public function getId(): ?int { return $this->id; }
    public function getPatient(): ?Patient { return $this->patient; }
    public function setPatient(?Patient $patient): static { $this->patient = $patient; return $this; }
    public function getDocteur(): ?Docteur { return $this->docteur; }
    public function setDocteur(?Docteur $docteur): static { $this->docteur = $docteur; return $this; }
    public function getDateRdv(): ?\DateTimeImmutable { return $this->date_rdv; }
    public function setDateRdv(\DateTimeImmutable $date_rdv): self { $this->date_rdv = $date_rdv; return $this; }
    public function getStatut(): ?StatutRendezVous { return $this->statut; }
    public function setStatut(StatutRendezVous $statut): self { $this->statut = $statut; return $this; }
    public function getHeurRdv(): ?\DateTimeInterface
    {
        return $this->heur_rdv;
    }
    public function setHeurRdv(\DateTime $heur_rdv): static
    {
        // Si c'est un nombre (ex: 14), le convertir en DateTime
        if (is_numeric($heur_rdv)) {
            $this->heur_rdv = new \DateTime(sprintf('%02d:00:00', $heur_rdv));
        }
        // Si c'est déjà un DateTime, l'utiliser directement
        elseif ($heur_rdv instanceof \DateTimeInterface) {
            $this->heur_rdv = $heur_rdv;
        }
        // Si c'est une string, la convertir
        elseif (is_string($heur_rdv)) {
            $this->heur_rdv = new \DateTime($heur_rdv);
        }
        // Sinon null
        else {
            $this->heur_rdv = null;
        }

        return $this;
    }
    public function getCreatedBy(): ?int
    {
        return $this->created_by;
    }
}
