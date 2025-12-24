<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class ApiController extends AbstractController
{
    #[Route('/api/hello', name: 'api_hello', methods: ['GET'])]
    public function hello(): JsonResponse
    {
        return $this->json([
            'message' => 'Hello API!',
            'status' => 200
        ]);
    }

    #[Route('/api/users', name: 'api_users', methods: ['GET'])]
    public function users(): JsonResponse
    {
        return $this->json([
            ['id' => 1, 'name' => 'Oussama'],
            ['id' => 2, 'name' => 'Ali'],
            ['id' => 3, 'name' => 'Sara'],
        ]);
    }

    #[Route('/api/post', name: 'api_post', methods: ['POST'])]
    public function post(): JsonResponse
    {
        return $this->json([
            'message' => 'Data received successfully!'
        ]);
    }
}
