<?php

namespace App\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class OrdonnanceProvider implements ProviderInterface
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $id = $uriVariables['id'] ?? null;
        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];
        $method = $operation->getMethod();

        if (in_array($method, ['PUT', 'DELETE']) && $id) {
            $o = new \App\ApiResource\Ordonnance();
            $o->id = $id;
            return $o;
        }

        if ($id) {
            $response = $this->httpClient->request('GET',
                'http://patient-service:8080/ordonnances/' . $id,
                ['headers' => $headers]
            )->toArray();
            return $this->mapToResource($response['data']);
        }

        $response = $this->httpClient->request('GET',
            'http://patient-service:8080/ordonnances',
            ['headers' => $headers]
        )->toArray();

        return array_map(fn($item) => $this->mapToResource($item), $response['data'] ?? []);
    }

    private function mapToResource(array $data): \App\ApiResource\Ordonnance
    {
        $o = new \App\ApiResource\Ordonnance();
        $o->id               = $data['idOrdonnance'] ?? $data['id'] ?? null;
        $o->idPatient        = $data['id_patient'] ?? $data['idPatient'] ?? null;
        $o->idDoctor         = $data['id_doctor'] ?? $data['idDoctor'] ?? null;
        $o->idVisite         = $data['id_visite'] ?? $data['idVisite'] ?? null;
        $o->description      = $data['description'] ?? null;
        $o->medicaments      = $data['medicaments'] ?? null;
        $o->posologie        = $data['posologie'] ?? null;
        $o->dureeTraitement  = $data['duree_traitement'] ?? $data['dureeTraitement'] ?? null;
        $o->instructions     = $data['instructions'] ?? null;
        $o->dateValidite     = $data['data_validite'] ?? $data['dateValidite'] ?? null;
        $o->statut           = $data['statut'] ?? 'ACTIVE';
        $o->dateCreation     = $data['date_creation'] ?? $data['dateCreation'] ?? null;
        return $o;
    }
}
