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

        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        if ($method === 'POST') {
            return $this->httpClient->request(
                'POST',
                'http://rdv-service:9000/api/rendez_vouses',
                ['headers' => $headers, 'json' => $data]
            )->toArray();
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
            )->toArray();
        }

        if ($method === 'DELETE' && $id) {
            return $this->httpClient->request(
                'DELETE',
                'http://rdv-service:9000/api/rendez_vouses/' . $id,
                ['headers' => $headers]
            )->getStatusCode();
        }

        return null;
    }
}
