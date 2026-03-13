<?php

namespace App\Provider;


use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class DossierMedicalProvider implements ProviderInterface
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

        $idPatient = $uriVariables['idPatient'] ?? null;

        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        $method = $operation->getMethod();

        if (in_array($method, ['PUT', 'DELETE']) && $idPatient) {
            $dossier = new \App\ApiResource\DossierMedical();
            $dossier->idPatient = $idPatient;
            return $dossier;
        }

        // GET single
        if ($idPatient) {
            $response = $this->httpClient->request('GET',
                'http://patient-service:8080/' . $idPatient . '/dossier-medical',
                ['headers' => $headers]
            )->toArray();

            $result = $response['data'];

            $dossier = new \App\ApiResource\DossierMedical();
            $dossier->idPatient = $result['idPatient'];
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

        // GET collection
        $response = $this->httpClient->request('GET',
            'http://patient-service:8080/dossiers',
            ['headers' => $headers]
        )->toArray();

        $items = $response['data'] ?? [];
        $dossiers = [];
        foreach ($items as $result) {
            $dossier = new \App\ApiResource\DossierMedical();
            $dossier->idPatient = $result['idPatient'];
            $dossier->status = $result['status'] ?? null;
            $dossier->poids = $result['poids'] ?? null;
            $dossier->taille = $result['taille'] ?? null;
            $dossier->groupeSanguin = $result['groupeSanguin'] ?? null;
            $dossier->antecedentsMedicaux = $result['antecedentsMedicaux'] ?? null;
            $dossier->allergies = $result['allergies'] ?? null;
            $dossier->pathologiesChroniques = $result['pathologiesChroniques'] ?? null;
            $dossier->notes = $result['notes'] ?? null;
            $dossier->diagnostic = $result['diagnostic'] ?? null;
            $dossiers[] = $dossier;
        }
        return $dossiers;
    }
}
