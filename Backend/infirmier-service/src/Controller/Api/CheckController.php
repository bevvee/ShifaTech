<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class CheckController extends AbstractController
{
    #[Route('/health', name: 'nurse_health', methods: ['GET'])]
    public function healthCheck(): Response
    {
        return new Response('Nurse Service is running!', Response::HTTP_OK);
    }
}
