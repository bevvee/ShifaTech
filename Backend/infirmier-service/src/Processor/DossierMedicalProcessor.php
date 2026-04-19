<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class DossierMedicalProcessor implements ProcessorInterface
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
        $idPatient = $uriVariables['idPatient'] ?? null;

        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        if ($method === 'POST') {
            $response = $this->httpClient->request(
                'POST',
                'http://patient-service:8080/dossier-medical',
                ['headers' => $headers, 'json' => (array) $data]
            )->toArray();

            return $this->buildDossier($response['data']);
        }

        if ($method === 'PUT' && $idPatient) {
            $body = array_filter((array) $data, fn($value) => $value !== null);

            $response = $this->httpClient->request(
                'PUT',
                'http://patient-service:8080/' . $idPatient . '/dossier-medical',
                ['headers' => $headers, 'json' => $body]
            )->toArray();

            return $this->buildDossier($response['data']);
        }

        if ($method === 'DELETE' && $idPatient) {
            $this->httpClient->request(
                'DELETE',
                'http://patient-service:8080/' . $idPatient . '/dossier-medical',
                ['headers' => $headers]
            );
            return null;
        }

        return null;
    }

    private function buildDossier(array $result): \App\ApiResource\DossierMedical
    {
        $dossier = new \App\ApiResource\DossierMedical();
        $dossier->idPatient           = $result['idPatient'];
        $dossier->idDossier           = $result['idDossier'] ?? null;
        $dossier->status              = $result['status'] ?? null;
        $dossier->poids               = $result['poids'] ?? null;
        $dossier->taille              = $result['taille'] ?? null;
        $dossier->groupeSanguin       = $result['groupeSanguin'] ?? null;
        $dossier->antecedentsMedicaux = $result['antecedentsMedicaux'] ?? null;
        $dossier->allergies           = $result['allergies'] ?? null;
        $dossier->pathologiesChroniques = $result['pathologiesChroniques'] ?? null;
        $dossier->notes               = $result['notes'] ?? null;
        $dossier->diagnostic          = $result['diagnostic'] ?? null;
        return $dossier;
    }
}
