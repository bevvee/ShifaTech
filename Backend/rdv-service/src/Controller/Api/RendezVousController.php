<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class RendezVousController extends AbstractController
{
    #[Route('/api/rendez/vous', name: 'app_api_rendez_vous')]
    public function index(): Response
    {
        return $this->render('api/rendez_vous/index.html.twig', [
            'controller_name' => 'Api/RendezVousController',
        ]);
    }
}
