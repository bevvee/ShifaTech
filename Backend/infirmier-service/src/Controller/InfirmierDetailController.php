<?php
namespace App\Controller;

use App\Service\InfirmierService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;  // ← changer Annotation par Attribute

#[Route('/')]
class InfirmierDetailController extends AbstractController
{
    public function __construct(
        private InfirmierService $infirmierService
    ) {}

    #[Route('/details/{id}', methods: ['GET'])]
    public function getDetail(int $id, Request $request): JsonResponse
    {
        $authHeader = $request->headers->get('Authorization', '');
        $dto = $this->infirmierService->getInfirmierDetail($id, $authHeader);

        if (!$dto) {
            return $this->json(['error' => true, 'message' => 'Infirmier introuvable'], 404);
        }

        return $this->json(['error' => false, 'infirmier' => $dto]);
    }

    #[Route('/details', methods: ['GET'])]
    public function getAllDetails(Request $request): JsonResponse
    {
        $authHeader = $request->headers->get('Authorization', '');
        $infirmiers = $this->infirmierService->getAllInfirmiersDetail($authHeader);

        return $this->json(['error' => false, 'infirmiers' => $infirmiers]);
    }
}
