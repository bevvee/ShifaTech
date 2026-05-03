<?php

namespace App\Service;

use App\Contract\AuthServiceClientInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AuthServiceClient implements AuthServiceClientInterface
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private LoggerInterface $logger,
        #[Autowire(env: 'AUTH_SERVICE_URL')]
        private string $authServiceUrl,
    ) {}

    public function getUserById(int $userId, string $authHeader): ?array
    {
        try {
            $response = $this->httpClient->request('GET', $this->authServiceUrl . '/user/' . $userId, [
                'headers' => $this->buildHeaders($authHeader),
            ])->toArray(false);

            if ($response['error'] ?? true) {
                $this->logger->warning('[AUTH] getUserById({id}) : {msg}', [
                    'id'  => $userId,
                    'msg' => $response['message'] ?? 'erreur inconnue',
                ]);
                return null;
            }

            return $response['user'] ?? null;

        } catch (TransportExceptionInterface $e) {
            $this->logger->error('[AUTH] getUserById({id}) transport error: {msg}', ['id' => $userId, 'msg' => $e->getMessage()]);
            return null;
        } catch (\Exception $e) {
            $this->logger->error('[AUTH] getUserById({id}) : {msg}', ['id' => $userId, 'msg' => $e->getMessage()]);
            return null;
        }
    }

    public function updateUser(int $userId, array $data, string $authHeader): bool
    {
        try {
            $response = $this->httpClient->request('PUT', $this->authServiceUrl . '/update/' . $userId, [
                'headers' => array_merge($this->buildHeaders($authHeader), ['Content-Type' => 'application/json']),
                'json'    => $data,
            ])->toArray(false);

            if ($response['error'] ?? true) {
                $this->logger->warning('[AUTH] updateUser({id}) : {msg}', [
                    'id'  => $userId,
                    'msg' => $response['message'] ?? 'erreur inconnue',
                ]);
                return false;
            }

            return true;

        } catch (TransportExceptionInterface $e) {
            $this->logger->error('[AUTH] updateUser({id}) transport error: {msg}', ['id' => $userId, 'msg' => $e->getMessage()]);
            return false;
        } catch (\Exception $e) {
            $this->logger->error('[AUTH] updateUser({id}) : {msg}', ['id' => $userId, 'msg' => $e->getMessage()]);
            return false;
        }
    }

    public function deleteUser(int $userId, string $authHeader): bool
    {
        try {
            $response = $this->httpClient->request('DELETE', $this->authServiceUrl . '/delete/' . $userId, [
                'headers' => $this->buildHeaders($authHeader),
            ])->toArray(false);

            if ($response['error'] ?? true) {
                $this->logger->warning('[AUTH] deleteUser({id}) : {msg}', [
                    'id'  => $userId,
                    'msg' => $response['message'] ?? 'erreur inconnue',
                ]);
                return false;
            }

            return true;

        } catch (TransportExceptionInterface $e) {
            $this->logger->error('[AUTH] deleteUser({id}) transport error: {msg}', ['id' => $userId, 'msg' => $e->getMessage()]);
            return false;
        } catch (\Exception $e) {
            $this->logger->error('[AUTH] deleteUser({id}) : {msg}', ['id' => $userId, 'msg' => $e->getMessage()]);
            return false;
        }
    }

    private function buildHeaders(string $authHeader): array
    {
        return $authHeader !== '' ? ['Authorization' => $authHeader] : [];
    }
}
