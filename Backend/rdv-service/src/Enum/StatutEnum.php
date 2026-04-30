<?php

namespace App\Enum;

enum StatutEnum: string
{
    case EN_ATTENTE = 'EN_ATTENTE';
    case CONFIRME = 'CONFIRME';
    case ANNULE = 'ANNULE';
    case TERMINE = 'TERMINE';
    case TERMINER = 'TERMINER';
}
