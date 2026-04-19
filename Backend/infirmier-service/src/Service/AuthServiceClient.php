<?php

namespace App\Service;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AuthServiceClient
{
    public function __construct(
        private HttpClientInterface $httpClient,
        #[Autowire(env: 'AUTH_SERVICE_URL')]
        private string $authServiceUrl
    ) {}

    public function getUserById(int $userId, string $authHeader): ?array
    {
        try {
            $response = $this->httpClient->request('GET', $this->authServiceUrl . '/user/' . $userId, [
                'headers' => [
                    'Authorization' => $authHeader,
                ],
            ]);

            $data = $response->toArray();

            if (!($data['error'] ?? true) && isset($data['user'])) {
                return $data['user'];
            }
        } catch (\Exception $e) {
            // auth-service indisponible
        }

        return null;
    }
}
