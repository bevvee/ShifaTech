<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\DTO\RendezVousView;
use App\Entity\RendezVous;
use App\Repository\RendezVousRepository;
use App\Service\DoctorServiceClient;
use App\Service\PatientServiceClient;
use Symfony\Component\HttpFoundation\RequestStack;

class RendezVousViewProvider implements ProviderInterface
{
    public function __construct(
        private RendezVousRepository $repository,
        private PatientServiceClient $patientClient,
        private DoctorServiceClient $doctorClient,
        private RequestStack $requestStack,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $request = $this->requestStack->getCurrentRequest();

        $idDocteurRaw = $request?->query->get('id_docteur');
        $idPatientRaw = $request?->query->get('id_patient');

        $isCurrentRoute = str_contains($request?->getPathInfo() ?? '', '/current');

        if ($isCurrentRoute) {
            $now = new \DateTimeImmutable();

            if ($idDocteurRaw !== null && $idDocteurRaw !== '') {
                $rdv = $this->repository->findCurrentByDoctor((int) $idDocteurRaw, $now);
            } elseif ($idPatientRaw !== null && $idPatientRaw !== '') {
                $rdv = $this->repository->findCurrentByPatient((int) $idPatientRaw, $now);
            } else {
                return null;
            }

            return $rdv ? [$this->toView($rdv)] : [];
        }

        if ($idDocteurRaw !== null && $idDocteurRaw !== '') {
            $rdvs = $this->repository->findBy(['id_docteur' => (int) $idDocteurRaw]);
        } elseif ($idPatientRaw !== null && $idPatientRaw !== '') {
            $rdvs = $this->repository->findBy(['id_patient' => (int) $idPatientRaw]);
        } else {
            $rdvs = $this->repository->findAll();
        }

        return array_map(
            fn (RendezVous $rdv) => $this->toView($rdv),
            $rdvs
        );
    }

    private function toView(RendezVous $rdv): RendezVousView
    {
        $id = (int) ($rdv->getId() ?? 0);
        $idPatient = (int) ($rdv->getIdPatient() ?? 0);
        $idDocteur = (int) ($rdv->getIdDocteur() ?? 0);

        $patient = $idPatient ? $this->patientClient->getPatientSummary($idPatient) : null;
        $docteur = $idDocteur ? $this->doctorClient->getDoctorSummary($idDocteur) : null;

        return new RendezVousView(
            id: $id,
            idPatient: $idPatient,
            idDocteur: $idDocteur,
            dateRdv: $rdv->getDateRdv()?->format('Y-m-d') ?? '',
            heureDebut: $rdv->getHeureDebut()?->format('H:i') ?? '',
            heureFin: $rdv->getHeureFin()?->format('H:i') ?? '',
            statut: $rdv->getStatut()?->value ?? '',
            patient: $patient,
            docteur: $docteur,
        );
    }
}