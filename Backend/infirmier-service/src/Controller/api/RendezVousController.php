<?php

namespace App\Controller\api;

use App\Dto\RendezVousDto;
use App\Entity\RendezVous;
use App\Enum\StatutRendezVous;
use App\Repository\DocteurRepository;
use App\Repository\PatientRepository;
use App\Repository\RendezVousRepository;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;


class RendezVousController extends AbstractController
{
    #[Route('/health', name: 'inf_health', methods: ['GET'])]
    public function healthCheck(): Response
    {
        return new Response('infi Service is UP');
    }





    #[Route('/api/{role}/rdv', name: 'api_list_rdv', methods: ['GET'])]
    public function list(RendezVousRepository          $rendezVousRepository,
                         string                        $role): JsonResponse
    {
        if ($role !== "secretaire" && $role !== "infirmier") {
            return $this->json(['error' => 'Vous n\'avez pas l\'accès'], 403);
        }

        $rdvs = array_map(function ($rdv) {
            $dto = new RendezVousDto();
            $dto->id = $rdv->getId();
            $dto->date = $rdv->getDateRdv()->format('Y-m-d H:i');
            $dto->statut = $rdv->getStatut() ? $rdv->getStatut()->value : 'EN_ATTENTE';
            return $dto;
        }, $rendezVousRepository->findAll());

        return $this->json($rdvs);
    }

    #[Route('/api/{role}/rdv/{id}', name: 'api_show_rdv', methods: ['GET'])]
    public function show(int    $id, RendezVousRepository $rendezVousRepository
        , SerializerInterface   $serializer,
                         string $role): JsonResponse
    {
        if ($role !== "secretaire" && $role !== "infirmier") {
            return $this->json(['error' => "Vous n'avez pas l'accès"], 403);
        }

        $rdv = $rendezVousRepository->find($id);

        if (!$rdv) {
            return $this->json(['error' => 'Rendez-vous non trouvé'], 404);
        }

        $jsonContent = $serializer->serialize($rdv, 'json', [
            'circular_reference_handler' => function ($object) {
                return $object->getId();
            }
        ]);

        return new JsonResponse($jsonContent, 200, [], true);
    }

    public function create(Request $request, RendezVousRepository $rendezVousRepository,
                           PatientRepository $patientRepository,
                           DocteurRepository $docteurRepository,
                           string $role): JsonResponse
    {
        if ($role !== "secretaire") {
            return $this->json(['error' => 'Action réservée aux secrétaires'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['date'])) {
            return $this->json(['error' => 'La date est obligatoire'], 400);
        }

        try {
            $dateRdv = new \DateTimeImmutable($data['date']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Format de date invalide'], 400);
        }

        // Création du rendez-vous
        $rdv = new RendezVous();
        $rdv->setDateRdv($dateRdv);

        try {
            $statutStr = $data['statut'] ?? 'EN_ATTENTE';
            $rdv->setStatut(StatutRendezVous::from($statutStr));
        } catch (\Exception $e) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }

        if (!empty($data['id_patient'])) {
            $patient = $patientRepository->find($data['id_patient']);
            if (!$patient) {
                return $this->json(['error' => 'Patient non trouvé'], 404);
            }
            $rdv->setPatient($patient);
        }

        if (!empty($data['id_docteur'])) {
            $docteur = $docteurRepository->find($data['id_docteur']);
            if (!$docteur) {
                return $this->json(['error' => 'Docteur non trouvé'], 404);
            }
            $rdv->setDocteur($docteur);
        }

        if (!empty($data['heur_rdv'])) {
            try {
                $heure = new \DateTime($data['heur_rdv']);
                $rdv->setHeurRdv($heure);
            } catch (\Exception $e) {
                return $this->json(['error' => "Format d'heure invalide"], 400);
            }
        }

        $rendezVousRepository->save($rdv, true);

        return $this->json([
            'id' => $rdv->getId(),
            'date' => $rdv->getDateRdv()->format('Y-m-d H:i:s'),
            'statut' => $rdv->getStatut()->value,
            'patient_id' => $rdv->getPatient()?->getId(),
            'docteur_id' => $rdv->getDocteur()?->getId(),
            'heure' => $rdv->getHeurRdv()?->format('H:i:s')
        ], 201);
    }

    #[Route('/api/{role}/rdv/{id}', name: 'api_update_rdv', methods: ['PUT'])]
    public function update(int                           $id, Request $request, RendezVousRepository $rendezVousRepository,
                           PatientRepository             $patientRepository,
                           DocteurRepository             $docteurRepository,
                           string                        $role,): JsonResponse
    {
        if ($role !== 'secretaire') {
            return $this->json(['error' => "Action refusé"], 403);
        }

        $rdv = $rendezVousRepository->find($id);

        if (!$rdv) {
            return $this->json(['error' => 'Rendez-vous non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['date'])) {
            try {
                $dateRdv = new \DateTimeImmutable($data['date']);
                $rdv->setDateRdv($dateRdv);
            } catch (\Exception $e) {
                return $this->json(['error' => 'Format de date invalide'], 400);
            }
        }

        if (isset($data['heur_rdv'])) {
            try {
                $heure = new \DateTime($data['heur_rdv']);
                $rdv->setHeurRdv($heure);
            } catch (\Exception $e) {
                return $this->json(['error' => "Format d'heure invalide"], 400);
            }
        }

        if (isset($data['statut'])) {
            try {
                $rdv->setStatut(StatutRendezVous::from($data['statut']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Statut invalide'], 400);
            }
        }

        $rendezVousRepository->save($rdv, true);

        return $this->json([
            'id' => $rdv->getId(),
            'date' => $rdv->getDateRdv()->format('Y-m-d H:i:s'),
            'heure' => $rdv->getHeurRdv() ? $rdv->getHeurRdv()->format('H:i:s') : null,
            'statut' => $rdv->getStatut()->value
        ]);
    }

    #[Route('/api/{role}/rdv/{id}', name: 'api_delete_rdv', methods: ['DELETE'])]
    public function delete(int                    $id, RendezVousRepository $rendezVousRepository,
                           EntityManagerInterface $entityManager,
                           string                 $role): JsonResponse
    {
        if ($role !== 'secretaire') {
            return $this->json(['error' => 'Action refusé'], 403);
        }


        $rdv = $rendezVousRepository->find($id);

        if (!$rdv) {
            return $this->json(['error' => "Rendez-vous non trouvé"], 404);
        }

        $entityManager->remove($rdv);
        $entityManager->flush();

        return $this->json(['message' => "Rendez-vous supprimé avec succès"]);
    }
}
