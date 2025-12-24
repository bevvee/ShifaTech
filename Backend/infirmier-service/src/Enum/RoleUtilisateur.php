<?php

namespace App\Enum;

enum RoleUtilisateur: string
{
    case ADMIN = 'admin';
    case DOCTEUR = 'docteur';
    case INFIRMIER = 'infirmier';
    case PATIENT = 'patient';

    public function getLabel(): string
    {
        return match($this) {
            self::ADMIN => 'Administrateur',
            self::DOCTEUR => 'Docteur',
            self::INFIRMIER => 'Infirmier',
            self::PATIENT => 'Patient',
        };
    }
    public function isAdmin(): bool
    {
        return $this === self::ADMIN;
    }

    public function isDocteur(): bool
    {
        return $this === self::DOCTEUR;
    }

    public function isInfirmier(): bool
    {
        return $this === self::INFIRMIER;
    }

    public function isPatient(): bool
    {
        return $this === self::PATIENT;
    }

    public function isMedicalStaff(): bool
    {
        return $this === self::DOCTEUR || $this === self::INFIRMIER;
    }

    public static function getValues(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function getOptions(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[$case->value] = $case->getLabel();
        }
        return $options;
    }
    public static function getValueRole(): array
    {
        return array_column(self::cases(), 'value');
    }
}
