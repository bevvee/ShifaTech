<?php

namespace App\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class VisiteProvider implements ProviderInterface
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack
    ) {}

    public function provide(
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ): object|array|null {

        $id = $uriVariables['id'] ?? null;
        $idDossier = $uriVariables['idDossier'] ?? null;

        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        $method = $operation->getMethod();

        if (in_array($method, ['PUT', 'DELETE']) && $id) {
            $visite = new \App\ApiResource\Visite();
            $visite->id = $id;
            return $visite;
        }

        // GET single
        if ($id) {
            $response = $this->httpClient->request('GET',
                'http://patient-service:8080/visites/' . $id,
                ['headers' => $headers]
            )->toArray();

            return $this->mapToVisite($response['data'] ?? $response);
        }

        // GET by dossier
        if ($idDossier) {
            $response = $this->httpClient->request('GET',
                'http://patient-service:8080/dossier/' . $idDossier . '/visites',
                ['headers' => $headers]
            )->toArray();

            return $this->mapCollection($response['data'] ?? []);
        }

        // GET collection
        $response = $this->httpClient->request('GET',
            'http://patient-service:8080/visites',
            ['headers' => $headers]
        )->toArray();

        return $this->mapCollection($response['data'] ?? []);
    }

    private function mapToVisite(array $result): \App\ApiResource\Visite
    {
        $visite = new \App\ApiResource\Visite();
        $visite->id = $result['idVisite'] ?? null;
        $visite->idDoctor = $result['idDoctor'] ?? null;
        $visite->idDossier = $result['idDossier'] ?? null;
        $visite->status = $result['status'] ?? null;
        $visite->planTraitement = $result['planTraitement'] ?? null;
        $visite->observations = $result['observations'] ?? null;
        $visite->dateCreation = $result['dateCreation'] ?? null;
        $visite->dateFermeture = $result['dateFermeture'] ?? null;
        return $visite;
    }

    private function mapCollection(array $items): array
    {
        return array_map(fn($item) => $this->mapToVisite($item), $items);
    }
}
