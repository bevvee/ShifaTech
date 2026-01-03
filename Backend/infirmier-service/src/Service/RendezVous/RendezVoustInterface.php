<?php

namespace App\Service\RendezVous;

interface RendezVoustInterface
{
    public function getRendezVous(array $filters = []): array;
    public function createRendezVous(array $data): array;
}
