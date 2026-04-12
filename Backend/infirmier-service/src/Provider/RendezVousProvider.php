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

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $request = $this->requestStack->getCurrentRequest();

        // Cherche le token dans tous les endroits possibles
        $authHeader = $request?->headers->get('Authorization')
            ?? $request?->server->get('HTTP_AUTHORIZATION')
            ?? $request?->query->get('token');

        $headers = [];
        if ($authHeader) {
            $headers['Authorization'] = $authHeader;
        }

        $method = $operation->getMethod();

        if ($method === 'DELETE') {
            $rdv = new \App\ApiResource\RendezVous();
            $rdv->id = (int) $uriVariables['id'];
            return $rdv;
        }

        $id = $uriVariables['id'] ?? null;

        try {
            if ($id) {
                $data = $this->httpClient->request('GET',
                    'http://rdv-service:9000/api/rendez_vouses/' . $id,
                    ['headers' => $headers]
                )->toArray(false);
                return $this->mapToRendezVous($data);
            }

            // Si pas de token, retourne tableau vide plutôt que crasher
            if (empty($headers)) {
                return [];
            }

            $response = $this->httpClient->request('GET',
                'http://rdv-service:9000/api/rendez_vouses',
                ['headers' => $headers]
            )->toArray(false);

            if (isset($response['hydra:member'])) {
                $items = $response['hydra:member'];
            } elseif (isset($response['member'])) {
                $items = $response['member'];
            } elseif (isset($response['data'])) {
                $items = $response['data'];
            } elseif (array_is_list($response)) {
                $items = $response;
            } else {
                $items = [];
            }

            return array_map(fn($r) => $this->mapToRendezVous($r), $items);

        } catch (\Throwable $e) {
            // Log et retourne vide plutôt que 500
            error_log('[RendezVousProvider] Erreur: ' . $e->getMessage());
            return [];
        }
    }
}
