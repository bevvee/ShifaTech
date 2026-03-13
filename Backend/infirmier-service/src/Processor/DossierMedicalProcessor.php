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

            $result = $response['data'];

            $dossier = new \App\ApiResource\DossierMedical();
            $dossier->idPatient = $result['idPatient'];
            $dossier->idDossier = $result['idDossier'] ?? null;
            $dossier->status = $result['status'] ?? null;
            $dossier->poids = $result['poids'] ?? null;
            $dossier->taille = $result['taille'] ?? null;
            $dossier->groupeSanguin = $result['groupeSanguin'] ?? null;
            $dossier->antecedentsMedicaux = $result['antecedentsMedicaux'] ?? null;
            $dossier->allergies = $result['allergies'] ?? null;
            $dossier->pathologiesChroniques = $result['pathologiesChroniques'] ?? null;
            $dossier->notes = $result['notes'] ?? null;
            $dossier->diagnostic = $result['diagnostic'] ?? null;
            return $dossier;
        }

        if ($method === 'PUT' && $idPatient) {
            $body = array_filter((array) $data, fn($value) => $value !== null);
            return $this->httpClient->request(
                'PUT',
                'http://patient-service:8080/' . $idPatient . '/dossier-medical',
                ['headers' => $headers, 'json' => $body]
            )->toArray();
            $result = $response['data'];

            $dossier = new \App\ApiResource\DossierMedical();
            $dossier->idPatient = $result['idPatient'];
            $dossier->idDossier = $result['idDossier'] ?? null;
            $dossier->status = $result['status'] ?? null;
            $dossier->poids = $result['poids'] ?? null;
            $dossier->taille = $result['taille'] ?? null;
            $dossier->groupeSanguin = $result['groupeSanguin'] ?? null;
            $dossier->antecedentsMedicaux = $result['antecedentsMedicaux'] ?? null;
            $dossier->allergies = $result['allergies'] ?? null;
            $dossier->pathologiesChroniques = $result['pathologiesChroniques'] ?? null;
            $dossier->notes = $result['notes'] ?? null;
            $dossier->diagnostic = $result['diagnostic'] ?? null;
            return $dossier;
        }

        if ($method === 'DELETE' && $idPatient) {
            $this->httpClient->request(
                'DELETE',
                'http://patient-service:8080/' . $idPatient . '/dossier-medical',
                ['headers' => $headers]
            )->getStatusCode();
            return null;
        }

        return null;
    }
}
