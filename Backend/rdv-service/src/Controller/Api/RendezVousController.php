<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class RendezVousController extends AbstractController
{
    #[Route('/health', name: 'health', methods: ['GET'])]
    public function healthCheck(): Response
    {
        return new Response(
            'rdv Service is running!',
        );
    }
}
