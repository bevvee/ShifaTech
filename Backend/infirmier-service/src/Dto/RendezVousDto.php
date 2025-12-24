<?php

namespace App\Dto;


class RendezVousDto
{
    public int $id;
    public string $date;
    public string $statut;
    public ?string $heure = null;

}
