<?php
namespace App\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class RendezVousProvider implements ProviderInterface
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
        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        $method = $operation->getMethod();

        if ($method === 'DELETE') {
            $rdv = new \App\ApiResource\RendezVous();
            $rdv->id = (int) $id;
            return $rdv;
        }

        // GET single
        if ($id) {
            $data = $this->httpClient->request('GET',
                'http://rdv-service:9000/api/rendez_vouses/' . $id,
                ['headers' => $headers]
            )->toArray(false);

            return $this->mapToRendezVous($data);
        }

        // GET collection
        $response = $this->httpClient->request('GET',
            'http://rdv-service:9000/api/rendez_vouses',
            ['headers' => $headers]
        )->toArray(false);
        file_put_contents('/tmp/rdv-list.log', json_encode($response) . "\n");

        // Gère les formats : tableau brut, Hydra, ou { data: [] }
        if (isset($response['hydra:member'])) {
            $items = $response['hydra:member'];
        } elseif (isset($response['member'])) {        // ← ajoute cette ligne
            $items = $response['member'];
        } elseif (isset($response['data'])) {
            $items = $response['data'];
        } elseif (array_is_list($response)) {
            $items = $response;
        } else {
            $items = [];
        }

        return array_map(fn($r) => $this->mapToRendezVous($r), $items);
    }

    private function mapToRendezVous(array $r): \App\ApiResource\RendezVous
    {
        $rdv = new \App\ApiResource\RendezVous();
        $rdv->id          = $r['id']          ?? null;
        $rdv->id_patient  = $r['id_patient']  ?? null;
        $rdv->id_docteur  = $r['id_docteur']  ?? null;
        $rdv->date_rdv    = $r['date_rdv']    ?? null;
        $rdv->heure_debut = $r['heure_debut'] ?? null;
        $rdv->heure_fin   = $r['heure_fin']   ?? null;
        $rdv->statut      = $r['statut']      ?? 'EN_ATTENTE';
        return $rdv;
    }
}
