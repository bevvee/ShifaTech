<?php

namespace App\Entity;

use App\Repository\BodyPartRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: BodyPartRepository::class)]
#[ORM\Table(name: 'body_parts')]
class BodyPart
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'bigint')]
    #[Groups(['body_map'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: BodySection::class, inversedBy: 'parts')]
    #[ORM\JoinColumn(name: 'body_section_id', nullable: false)]
    private ?BodySection $bodySection = null;

    #[ORM\Column(length: 100)]
    #[Groups(['body_map'])]
    private string $code;

    #[ORM\Column(length: 255)]
    #[Groups(['body_map'])]
    private string $label;

    #[ORM\Column(type: 'string', columnDefinition: "ENUM('path','ellipse')")]
    #[Groups(['body_map'])]
    private string $shapeType;

    #[ORM\Column(type: 'json')]
    #[Groups(['body_map'])]
    private array $coords = [];

    #[ORM\Column(type: 'boolean')]
    #[Groups(['body_map'])]
    private bool $clickable = true;

    // ---------------- Getters & Setters ----------------

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBodySection(): ?BodySection
    {
        return $this->bodySection;
    }

    public function setBodySection(?BodySection $bodySection): self
    {
        $this->bodySection = $bodySection;
        return $this;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function setCode(string $code): self
    {
        $this->code = $code;
        return $this;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function setLabel(string $label): self
    {
        $this->label = $label;
        return $this;
    }

    public function getShapeType(): string
    {
        return $this->shapeType;
    }

    public function setShapeType(string $shapeType): self
    {
        $this->shapeType = $shapeType;
        return $this;
    }

    public function getCoords(): array
    {
        return $this->coords;
    }

    public function setCoords(array $coords): self
    {
        $this->coords = $coords;
        return $this;
    }
        public function getClickable(): bool
    {
        return $this->clickable;
    }

    public function isClickable(): bool
    {
        return $this->clickable;
    }

    public function setClickable(bool $clickable): self
    {
        $this->clickable = $clickable;
        return $this;
    }
}
