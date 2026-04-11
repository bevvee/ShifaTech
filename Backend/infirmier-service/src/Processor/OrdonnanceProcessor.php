<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class OrdonnanceProcessor implements ProcessorInterface
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        $method = $operation->getMethod();
        $id = $uriVariables['id'] ?? null;
        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        if ($method === 'POST') {
            $response = $this->httpClient->request('POST',
                'http://patient-service:8080/ordonnances',
                ['headers' => $headers, 'json' => $this->toPayload($data)]
            )->toArray();
            return $this->buildResource($response['data']);
        }

        if ($method === 'PUT' && $id) {
            $response = $this->httpClient->request('PUT',
                'http://patient-service:8080/ordonnances/' . $id,
                ['headers' => $headers, 'json' => $this->toPayload($data)]
            )->toArray();
            return $this->buildResource($response['data']);
        }

        if ($method === 'DELETE' && $id) {
            $this->httpClient->request('DELETE',
                'http://patient-service:8080/ordonnances/' . $id,
                ['headers' => $headers]
            );
            return null;
        }

        return null;
    }

    private function toPayload(object $data): array
    {
        return array_filter([
            'id_patient'       => $data->idPatient ?? null,
            'id_doctor'        => $data->idDoctor ?? null,
            'id_visite'        => $data->idVisite ?? null,
            'description'      => $data->description ?? null,
            'medicaments'      => $data->medicaments ?? null,
            'posologie'        => $data->posologie ?? null,
            'duree_traitement' => $data->dureeTraitement ?? null,
            'instructions'     => $data->instructions ?? null,
            'data_validite'    => $data->dateValidite ?? null,
            'statut'           => $data->statut ?? 'ACTIVE',
        ], fn($v) => $v !== null);
    }

    private function buildResource(array $data): \App\ApiResource\Ordonnance
    {
        $o = new \App\ApiResource\Ordonnance();
        $o->id              = $data['idOrdonnance'] ?? $data['id'] ?? null;
        $o->idPatient       = $data['id_patient'] ?? $data['idPatient'] ?? null;
        $o->idDoctor        = $data['id_doctor'] ?? $data['idDoctor'] ?? null;
        $o->idVisite        = $data['id_visite'] ?? $data['idVisite'] ?? null;
        $o->description     = $data['description'] ?? null;
        $o->medicaments     = $data['medicaments'] ?? null;
        $o->posologie       = $data['posologie'] ?? null;
        $o->dureeTraitement = $data['duree_traitement'] ?? $data['dureeTraitement'] ?? null;
        $o->instructions    = $data['instructions'] ?? null;
        $o->dateValidite    = $data['data_validite'] ?? $data['dateValidite'] ?? null;
        $o->statut          = $data['statut'] ?? 'ACTIVE';
        $o->dateCreation    = $data['date_creation'] ?? $data['dateCreation'] ?? null;
        return $o;
    }
}
