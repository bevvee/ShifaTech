<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AuthServiceClient
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack
    ) {}

    public function getUserEmail(int $userId): ?string
    {
        $request = $this->requestStack->getCurrentRequest();
        $jwt = $request?->headers->get('Authorization');

        $response = $this->httpClient->request(
            'GET',
            sprintf('http://auth-service:8080/user/%d', $userId),
            [
                'headers' => [
                    'Authorization' => $jwt
                ]
            ]
        );

        if ($response->getStatusCode() !== 200) {
            $content = $response->getContent(false);
            throw new \RuntimeException(
                'auth-service error '.$response->getStatusCode().' : '.$content
            );
        }

        $data = $response->toArray(false);

        return $data['user']['email'] ?? null;
    }
}
