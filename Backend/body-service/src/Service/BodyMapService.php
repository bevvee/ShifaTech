<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\BodyPart;
use App\Entity\BodySection;
use App\Repository\BodyPartRepository;
use App\Repository\BodySectionRepository;
use LogicException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class BodyMapService
{
    public function __construct(
        private BodySectionRepository $sectionRepository,
        private BodyPartRepository $partRepository,
        #[Autowire('%env(BASE_URL)%')]
        private string $baseUrl,
    ) {
    }

    /**
     * Sections ordonnées + uniquement les body_parts liés par body_section_id (requête explicite).
     *
     * @return list<array<string, mixed>>
     */
    public function getAllSectionsWithParts(): array
    {
        $sections = $this->sectionRepository->findAllWithParts();
        $result = [];

        foreach ($sections as $section) {
            $parts = [];
            foreach ($section->getParts() as $part) {
                $this->assertPartScopedToSection($part, $section);
                $parts[] = $this->serializePart($part, $section);
            }

            $result[] = [
                'code' => $section->getCode(),
                'name' => $section->getName(),
                'order' => $section->getOrder(),
                'height' => $section->getHeight(),
                'width' => $section->getWidth(),
                'background_image' => $this->baseUrl . '/body/images/body/' . $section->getBackgroundImage(),
                'parts' => $parts,
            ];
        }

        return $result;
    }

    private function assertPartScopedToSection(BodyPart $part, BodySection $section): void
    {
        $ps = $part->getBodySection();
        if ($ps === null) {
            throw new LogicException(sprintf('Part %s (%s) sans body_section.', $part->getCode(), $part->getLabel()));
        }
        if ($ps->getId() !== null && $section->getId() !== null && $ps->getId() !== $section->getId()) {
            throw new LogicException(sprintf(
                'Incohérence: la partie « %s » (id %s) est rattachée à une autre section que « %s ».',
                $part->getLabel(),
                (string) $part->getId(),
                $section->getCode(),
            ));
        }
    }

    /**
     * @return array{id: int|null, code: string, section_code: string, label: string, shape: string, coords: array, is_clickable: bool}
     */
    private function serializePart(BodyPart $part, BodySection $section): array
    {
        return [
            'id' => $part->getId(),
            'code' => $part->getCode(),
            'section_code' => $section->getCode(),
            'label' => $part->getLabel(),
            'shape' => $part->getShapeType(),
            'coords' => $part->getCoords(),
            'is_clickable' => $part->getClickable(),
        ];
    }

    public function findSectionWithPart(string $sectionCode, string $partCode)
    {
        return $this->sectionRepository->findSectionWithPart($sectionCode, $partCode);
    }

    public function findSectionByCode(string $sectionCode)
    {
        return $this->sectionRepository->findByCode($sectionCode);
    }

    public function findPartByCodes(string $sectionCode, string $partCode)
    {
        return $this->partRepository->findPartByCodes($sectionCode, $partCode);
    }

    public function getPartsBySection(string $sectionCode): array
    {
        return $this->partRepository->findPartsBySection($sectionCode);
    }
}
