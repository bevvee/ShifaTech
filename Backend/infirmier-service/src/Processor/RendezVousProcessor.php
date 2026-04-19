<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class RendezVousProcessor implements ProcessorInterface
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

        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization')
            ?? $this->requestStack->getCurrentRequest()?->server->get('HTTP_AUTHORIZATION')
            ?? null;

        // LOG
        file_put_contents('/tmp/debug.log', json_encode([
            'method' => $method,
            'auth'   => $authHeader ?? 'AUCUN TOKEN',
            'data'   => (array) $data,
        ]) . "\n", FILE_APPEND);

        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        if ($method === 'POST') {
            $response = $this->httpClient->request(
                'POST',
                'http://rdv-service:9000/api/rendez_vouses',
                [
                    'headers' => array_merge($headers, [
                        'Content-Type' => 'application/json',
                        'Accept'       => 'application/json',
                    ]),
                    'json' => [
                        'id_patient'  => $data->id_patient,
                        'id_docteur'  => $data->id_docteur,
                        'date_rdv'    => $data->date_rdv,
                        'heure_debut' => $data->heure_debut,
                        'heure_fin'   => $data->heure_fin,
                        'statut'      => $data->statut ?: 'EN_ATTENTE',
                    ]
                ]
            )->toArray(false);

            return $this->mapToRendezVous($response);
        }

        if ($method === 'PATCH' && $id) {
            $request = $this->requestStack->getCurrentRequest();
            $rawData = json_decode($request->getContent(), true) ?? [];

            return $this->httpClient->request(
                'PATCH',
                'http://rdv-service:9000/api/rendez_vouses/' . $id,
                [
                    'headers' => array_merge($headers, [
                        'Content-Type' => 'application/merge-patch+json'
                    ]),
                    'body' => json_encode($rawData)
                ]
            )->toArray(false);
        }

        if ($method === 'DELETE' && $id) {
            $this->httpClient->request(
                'DELETE',
                'http://rdv-service:9000/api/rendez_vouses/' . $id,
                ['headers' => $headers]
            )->getStatusCode();
            return null;
        }

        return null;
    }

    private function mapToRendezVous(array $r): \App\ApiResource\RendezVous
    {
        file_put_contents('/tmp/rdv-response.log', json_encode($r) . "\n", FILE_APPEND);

        $rdv = new \App\ApiResource\RendezVous();
        $rdv->id          = $r['id'] ?? $r['idRdv'] ?? $r['id_rdv'] ?? $r['rendezVousId'] ?? 999;
        $rdv->id_patient  = $r['id_patient']  ?? $r['idPatient']  ?? null;
        $rdv->id_docteur  = $r['id_docteur']  ?? $r['idDocteur']  ?? null;
        $rdv->date_rdv    = $r['date_rdv']    ?? $r['dateRdv']    ?? null;
        $rdv->heure_debut = $r['heure_debut'] ?? $r['heureDebut'] ?? null;
        $rdv->heure_fin   = $r['heure_fin']   ?? $r['heureFin']   ?? null;
        $rdv->statut      = $r['statut']      ?? 'EN_ATTENTE';
        return $rdv;
    }
}
