<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class DossierMedicalController extends AbstractController
{
    #[Route('/dossier/medical', name: 'app_dossier_medical')]
    public function index(): Response
    {
        return $this->render('dossier_medical/index.html.twig', [
            'controller_name' => 'DossierMedicalController',
        ]);
    }
}
