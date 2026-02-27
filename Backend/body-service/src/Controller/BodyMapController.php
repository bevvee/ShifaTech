<?php

namespace App\Controller;

use App\Service\BodyMapService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/body-map')]
class BodyMapController extends AbstractController
{
    public function __construct(private BodyMapService $bodyMapService) {}

    /**
     * Full body sections + parts
     */
    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $sections = $this->bodyMapService->getAllSectionsWithParts();

        return $this->json($sections, 200, [], ['groups' => ['body_map']]);
    }

    /**
     * GET /part-label?section=HEAD&part=EYE_LEFT
     */
    #[Route('/part-label', methods: ['GET'])]
    public function getPartLabel(Request $request): JsonResponse
    {
        $sectionCode = $request->query->get('section');
        $partCode = $request->query->get('part');

        if (!$sectionCode || !$partCode) {
            return $this->json([
                'error' => true,
                'message' => 'section and part parameters are required'
            ], 400);
        }

        $part = $this->bodyMapService->findPartByCodes($sectionCode, $partCode);

        if (!$part) {
            return $this->json([
                'error' => true,
                'message' => 'Body part not found'
            ], 404);
        }

        return $this->json([
            'error' => false,
            'label' => $part->getLabel()
        ]);
    }
}
