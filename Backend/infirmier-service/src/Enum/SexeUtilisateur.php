<?php

namespace App\Enum;

enum SexeUtilisateur: string
{
    case M = 'M';
    case F = 'F';

    public function getLabel(): string
    {
        return match($this) {
            self::M => 'Masculin',
            self::F => 'Féminin',
        };
    }
    public static function getValueSexe(): array
    {
        return array_column(self::cases(), 'value');
    }

}
