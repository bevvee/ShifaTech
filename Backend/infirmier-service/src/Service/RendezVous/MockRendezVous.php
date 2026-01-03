<?php

namespace App\Service\RendezVous;

class MockRendezVous implements RendezVoustInterface
{
    private $rendezvous = [];
    private $nextId = 1;

    public function __construct()
    {
        // Données TEST pour commencer à développer
        $this->rendezvous = [
            [
                'id' => $this->nextId++,
                'patient_id' => 101,
                'date' => '2024-12-31T10:00:00Z',
                'service' => 'infirmier',
                'statut' => 'planifie'
            ],
            [
                'id' => $this->nextId++,
                'patient_id' => 102,
                'date' => '2024-12-31T14:00:00Z',
                'service' => 'infirmier',
                'statut' => 'confirme'
            ]
        ];
    }

    public function getRendezVous(array $filters = []): array
    {
        // Simule la récupération des rendez-vous
        $result = $this->rendezvous;

        // Filtre par service si demandé
        if (isset($filters['service'])) {
            $result = array_filter($result, function($r) use ($filters) {
                return $r['service'] === $filters['service'];
            });
        }

        return array_values($result);
    }

    public function createRendezVous(array $data): array
    {
        // Simule la création d'un rendez-vous
        $newRdv = [
            'id' => $this->nextId++,
            'patient_id' => $data['patient_id'],
            'date' => $data['date'],
            'service' => $data['service'],
            'statut' => 'planifie'
        ];

        $this->rendezvous[] = $newRdv;
        return $newRdv;
    }
}
