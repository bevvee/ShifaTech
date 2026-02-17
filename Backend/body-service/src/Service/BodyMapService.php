<?php

namespace App\Service;

use App\Repository\BodyPartRepository;
use App\Repository\BodySectionRepository;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class BodyMapService
{
    public function __construct(
        private BodySectionRepository $sectionRepository,
        private BodyPartRepository $partRepository,
        #[Autowire('%env(BASE_URL)%')]
        private string $baseUrl
    ) {}


    /**
     * Get all body sections with parts
     */
    public function getAllSectionsWithParts(): array
    {
        $sections = $this->sectionRepository->findAll();
        $result = [];
        foreach ($sections as $section) {
            $parts = [];
            foreach ($section->getParts() as $part) {
                $parts[] = [
                    'code' => $part->getCode(),
                    'label' => $part->getLabel(),
                    'shape' => $part->getShapeType(),
                    'coords' => $part->getCoords(),
                    'is_clickable' => $part->getClickable(),
                ];
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

    /**
     * Find section with specific part
     */
    public function findSectionWithPart(string $sectionCode, string $partCode)
    {
        return $this->sectionRepository->findSectionWithPart($sectionCode, $partCode);
    }

    /**
     * Find section by code
     */
    public function findSectionByCode(string $sectionCode)
    {
        return $this->sectionRepository->findByCode($sectionCode);
    }

    /**
     * Find part by section code and part code
     */
    public function findPartByCodes(string $sectionCode, string $partCode)
    {
        return $this->partRepository->findPartByCodes($sectionCode, $partCode);
    }

    /**
     * Get all parts for a section
     */
    public function getPartsBySection(string $sectionCode): array
    {
        return $this->partRepository->findPartsBySection($sectionCode);
    }
}
