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

        // Pour DELETE, retourner un objet fictif sans appeler le rdv-service
        $method = $operation->getMethod();
        if ($method === 'DELETE') {
            $rdv = new \App\ApiResource\RendezVous();
            $rdv->id = $id;
            return $rdv;
        }
        // GET single
        if ($id) {
            return $this->httpClient->request('GET',
                'http://rdv-service:9000/api/rendez_vouses/' . $id,
                ['headers' => $headers]
            )->toArray();
        }

        // GET collection
        return $this->httpClient->request('GET',
            'http://rdv-service:9000/api/rendez_vouses',
            ['headers' => $headers]
        )->toArray();
    }
}
