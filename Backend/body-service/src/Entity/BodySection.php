<?php

namespace App\Entity;

use App\Repository\BodySectionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: BodySectionRepository::class)]
#[ORM\Table(name: 'body_sections')]
class BodySection
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'bigint')]
    #[Groups(['body_map'])]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['body_map'])]
    private string $code;

    #[ORM\Column(length: 100)]
    #[Groups(['body_map'])]
    private string $name;

    #[ORM\Column(name: '`order`', type: 'bigint')]
    #[Groups(['body_map'])]
    private int $order;

    #[ORM\Column(length: 255)]
    #[Groups(['body_map'])]
    private string $backgroundImage;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['body_map'])]
    private ?int $width = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['body_map'])]
    private ?int $height = null;

    #[ORM\OneToMany(mappedBy: 'bodySection', targetEntity: BodyPart::class)]
    #[Groups(['body_map'])]
    private Collection $parts;

    public function __construct()
    {
        $this->parts = new ArrayCollection();
    }

    // ---------------- Getters & Setters ----------------

    public function getId(): ?int
    {
        return $this->id;
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

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getOrder(): int
    {
        return $this->order;
    }

    public function setOrder(int $order): self
    {
        $this->order = $order;
        return $this;
    }

    public function getBackgroundImage(): string
    {
        return $this->backgroundImage;
    }

    public function setBackgroundImage(string $backgroundImage): self
    {
        $this->backgroundImage = $backgroundImage;
        return $this;
    }

    public function getWidth(): ?int
    {
        return $this->width;
    }

    public function setWidth(?int $width): self
    {
        $this->width = $width;
        return $this;
    }

    public function getHeight(): ?int
    {
        return $this->height;
    }

    public function setHeight(?int $height): self
    {
        $this->height = $height;
        return $this;
    }

    /**
     * @return Collection<int, BodyPart>
     */
    public function getParts(): Collection
    {
        return $this->parts;
    }

    public function addPart(BodyPart $part): self
    {
        if (!$this->parts->contains($part)) {
            $this->parts->add($part);
            $part->setBodySection($this);
        }

        return $this;
    }

    public function removePart(BodyPart $part): self
    {
        if ($this->parts->removeElement($part)) {
            if ($part->getBodySection() === $this) {
                $part->setBodySection(null);
            }
        }

        return $this;
    }
}
