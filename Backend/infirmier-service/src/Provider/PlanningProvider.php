<?php

namespace App\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\RequestStack;
class PlanningProvider implements ProviderInterface
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

        $doctorId = $uriVariables['doctorId'] ?? null;

        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        $response = $this->httpClient->request('GET',
            'http://doctor-service:8080/planning/' . $doctorId,
            ['headers' => $headers]
        )->toArray();
        file_put_contents('/tmp/debug_planning.log', json_encode($response, JSON_PRETTY_PRINT));
        return array_map(function($item) {
            $planning = new \App\ApiResource\Planning();
            $planning->idPlan = $item['idPlan'] ?? null;
            $planning->idDoctor = $item['idDoctor'] ?? null;
            $planning->jour = $item['jour'] ?? null;
            $planning->heureDebut = $item['heureDebut'] ?? null;
            $planning->heureFin = $item['heureFin'] ?? null;
            $planning->pauseDebut = $item['pauseDebut'] ?? null;
            $planning->pauseFin = $item['pauseFin'] ?? null;
            $planning->createdAt = $item['createdAt'] ?? null;
            $planning->updatedAt = $item['updatedAt'] ?? null;
            return $planning;
        }, $response);
    }
}
