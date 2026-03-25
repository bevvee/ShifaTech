<?php

namespace App\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\InfirmierResource;
use App\Repository\InfirmierRepository;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class InfirmierProvider implements ProviderInterface
{
    public function __construct(
        private InfirmierRepository $infirmierRepository,
        private HttpClientInterface $httpClient,
    ) {}

    public function provide(
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ): object|array|null {

        $id = $uriVariables['id'] ?? null;
        $method = $operation->getMethod();

        if (in_array($method, ['PUT', 'DELETE']) && $id) {
            $resource = new InfirmierResource();
            $resource->id = $id;
            return $resource;
        }

        if ($id) {
            $infirmier = $this->infirmierRepository->find($id);
            if (!$infirmier) return null;
            return $this->mapToResource($infirmier);
        }

        return array_map(
            fn($infirmier) => $this->mapToResource($infirmier),
            $this->infirmierRepository->findAll()
        );
    }

    private function mapToResource(\App\Entity\Infirmier $infirmier): InfirmierResource
    {
        $resource = new InfirmierResource();
        $resource->id = $infirmier->getId();
        $resource->id_utilisateur = $infirmier->getIdUtilisateur();
        $resource->id_specialite = $infirmier->getIdSpecialite()?->getId();

        // Appel à auth-service pour récupérer les infos utilisateur
        try {
            $authUrl = $_ENV['AUTH_SERVICE_URL'] ?? 'http://auth-service:8080';
            $response = $this->httpClient->request(
                'GET',
                "{$authUrl}/users/{$infirmier->getIdUtilisateur()}"
            );
            $userData = $response->toArray();

            $resource->nom          = $userData['nom'] ?? null;
            $resource->prenom       = $userData['prenom'] ?? null;
            $resource->cin          = $userData['cin'] ?? null;
            $resource->email        = $userData['email'] ?? null;
            $resource->sexe         = $userData['sexe'] ?? null;
            $resource->statut       = $userData['statut'] ?? true;
            $resource->dateNaissance = $userData['dateNaissance'] ?? null;
            $resource->telephone    = $userData['telephone'] ?? null;
            $resource->adresse      = $userData['adresse'] ?? null;
        } catch (\Throwable $e) {
            // Si auth-service ne répond pas, on retourne quand même les données de base
        }

        return $resource;
    }
}
