<?php

namespace App\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\InfirmierResource;
use App\Repository\InfirmierRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class InfirmierProvider implements ProviderInterface
{
    public function __construct(
        private InfirmierRepository $infirmierRepository,
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack
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

        // Récupérer les infos depuis auth-service
        try {
            $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
            $headers = $authHeader ? ['Authorization' => $authHeader] : [];

            $response = $this->httpClient->request(
                'GET',
                'http://auth-service:8080/user/' . $infirmier->getIdUtilisateur(),
                ['headers' => $headers]
            )->toArray();

            $user = $response['user'] ?? [];
            $resource->nom = $user['nom'] ?? null;
            $resource->prenom = $user['prenom'] ?? null;
            $resource->cin = $user['cin'] ?? null;
            $resource->email = $user['email'] ?? null;
            $resource->sexe = $user['sexe'] ?? null;
            $resource->statut = $user['statut'] ?? false;
            $resource->dateNaissance = $user['dateNaissance'] ?? null;
            $resource->telephone = $user['telephone'] ?? null;
            $resource->adresse = $user['adresse'] ?? null;
        } catch (\Exception $e) {
            // Continue sans les données auth
        }

        return $resource;
    }
}
