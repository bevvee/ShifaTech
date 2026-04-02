<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\DTO\RendezVousView;
use App\Repository\RendezVousRepository;
use App\Service\AuthServiceClient;
use App\Service\DoctorServiceClient;
use App\Service\PatientServiceClient;

class RendezVousViewProvider implements ProviderInterface
{
    public function __construct(
        private RendezVousRepository $repository,
        private PatientServiceClient $patientClient,
        private DoctorServiceClient $doctorClient,
        private AuthServiceClient $authClient
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $rdvs = $this->repository->findAll();
        $result = [];

        foreach ($rdvs as $rdv) {
            $patient = $this->patientClient->getPatient($rdv->getIdPatient());
            $doctor = $this->doctorClient->getDoctor($rdv->getIdDocteur());

            $view = new RendezVousView();

            $view->id = $rdv->getId();
            $view->date = $rdv->getDateRdv()?->format('Y-m-d') ?? '';
            $view->heureDebut = $rdv->getHeureDebut()?->format('H:i') ?? '';
            $view->heureFin = $rdv->getHeureFin()?->format('H:i') ?? '';
            $view->statut = $rdv->getStatut()?->value ?? '';

            $view->patientId = $rdv->getIdPatient();
            $view->patientNom = $patient['nom'] ?? '';
            $view->patientPrenom = $patient['prenom'] ?? '';

            $view->doctorId = $rdv->getIdDocteur();
            $view->doctorNom = $doctor['nom'] ?? '';
            $view->doctorPrenom = $doctor['prenom'] ?? '';

            $result[] = $view;
        }

        return $result;
    }
}
