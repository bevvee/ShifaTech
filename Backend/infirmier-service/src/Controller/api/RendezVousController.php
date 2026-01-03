<?php

namespace App\Controller\Api;

use App\Service\RendezVous\RendezVoustInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/infirmier')]
class RendezVousController extends AbstractController
{
    public function __construct(
        private RendezVoustInterface $rendezVous
    ) {}
    #[Route('/list', methods: ['GET'])]
    public function getRendezVous(Request $request): JsonResponse
    {
        $filters = $request->query->all();

        $rendezvous = $this->rendezVous->getRendezVous($filters);

        return $this->json([
            'success' => true,
            'data' => $rendezvous
        ]);
    }

    #[Route('/creation', methods: ['POST'])]
    public function createRendezVous(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $newRdv = $this->rendezVous->createRendezVous($data);

        return $this->json([
            'success' => true,
            'data' => $newRdv
        ], Response::HTTP_CREATED);
    }
    #[Route('/modification/{id}', methods: ['PUT'])]
    public function updateRendezVous(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $updatedRdv = $this->rendezVous->updateRendezVous($id, $data);

        return $this->json([
            'success' => true,
            'data' => $updatedRdv,
            'message' => "Rendez-vous {$id} mis à jour avec succès"
        ]);
    }
    #[Route('/suppression/{id}', methods: ['DELETE'])]
    public function deleteRendezVous(int $id): JsonResponse
    {
        return $this->json([
            'success' => true,
            'message' => "Rendez-vous {$id} supprimé"
        ]);
    }
    #[Route("/health", name: 'infirmier_health', methods: ['GET'])]
    public function healthCheck(): Response
    {
        return new Response('Infirmier Service is running!', Response::HTTP_OK);
    }
}
