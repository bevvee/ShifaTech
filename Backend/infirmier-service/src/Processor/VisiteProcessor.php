<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class VisiteProcessor implements ProcessorInterface
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack
    ) {}

    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ) {
        $method = $operation->getMethod();
        $id = $uriVariables['id'] ?? null;

        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        if ($method === 'POST') {
            $response = $this->httpClient->request(
                'POST',
                'http://patient-service:8080/visites',
                ['headers' => $headers, 'json' => (array) $data]
            )->toArray();

            return $this->mapToVisite($response['data'] ?? $response);
        }

        if ($method === 'PUT' && $id) {
            $body = array_filter((array) $data, fn($value) => $value !== null);
            $response = $this->httpClient->request(
                'PUT',
                'http://patient-service:8080/visites/' . $id,
                ['headers' => $headers, 'json' => $body]
            )->toArray();

            return $this->mapToVisite($response['data'] ?? $response);
        }

        if ($method === 'DELETE' && $id) {
            $this->httpClient->request(
                'DELETE',
                'http://patient-service:8080/visites/' . $id,
                ['headers' => $headers]
            )->getStatusCode();
            return null;
        }

        return null;
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
}
