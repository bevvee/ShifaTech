<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\BodyPart;
use InvalidArgumentException;

/**
 * Règles métier pour éviter les body_parts dans la mauvaise section (régression DB).
 * À enrichir au fil du vocabulaire anatomique du projet.
 */
final class BodyPartConsistencyChecker
{
    public function __construct(
        private readonly bool $strict = true,
    ) {
    }

    public function assertConsistent(BodyPart $part): void
    {
        if (!$this->strict) {
            return;
        }

        $section = $part->getBodySection();
        if ($section === null) {
            throw new InvalidArgumentException('body_part sans body_section.');
        }

        $code = $section->getCode();
        $label = $part->getLabel();

        match ($code) {
            'front' => $this->assertNotBackAnatomyOnFront($label),
            'back' => $this->assertNotFrontAnatomyOnBack($label),
            default => null,
        };
    }

    private function assertNotBackAnatomyOnFront(string $label): void
    {
        foreach ($this->backOnlyPatterns() as $pattern) {
            if (preg_match($pattern, $label) === 1) {
                throw new InvalidArgumentException(sprintf(
                    'Partie « %s » ne peut pas être en vue « front » (motif: %s).',
                    $label,
                    $pattern,
                ));
            }
        }
    }

    private function assertNotFrontAnatomyOnBack(string $label): void
    {
        foreach ($this->frontOnlyPatterns() as $pattern) {
            if (preg_match($pattern, $label) === 1) {
                throw new InvalidArgumentException(sprintf(
                    'Partie « %s » ne peut pas être en vue « back » (motif: %s).',
                    $label,
                    $pattern,
                ));
            }
        }
    }

    /**
     * @return list<string> regex PCRE
     */
    private function backOnlyPatterns(): array
    {
        return [
            '/^Dos/u',
            '/\bFesse/u',
            '/^Nuque$/u',
            '/Tête\s+arrière/u',
            '/Épaule\s+arrière/u',
            '/Main\s+dos/u',
            '/Pied\s+dos/u',
            '/Doigt.+dos/ui',
            '/Dos\s+(supérieur|inférieur|central)/u',
        ];
    }

    /**
     * @return list<string> regex PCRE
     */
    private function frontOnlyPatterns(): array
    {
        return [
            '/^Nez$/u',
            '/^Bouche$/u',
            '/^Langue$/u',
            '/^Dent$/u',
            '/^Poitrine/u',
            '/^Abdomen$/u',
            '/^Bassin$/u',
            '/^Sternum$/u',
            '/^Tête$/u',
            '/^Cou$/u',
            '/Œil/u',
            '/Oreille/u',
        ];
    }
}
