<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PatientServiceClient
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack
    ) {}

    public function resolvePatientUserId(int $patientId): int
    {
        $request = $this->requestStack->getCurrentRequest();
        $jwt = $request?->headers->get('Authorization');

        $response = $this->httpClient->request(
            'GET',
            sprintf('http://patient-service:8080/patients/%d', $patientId),
            [
                'headers' => [
                    'Authorization' => $jwt
                ]
            ]
        );

        if ($response->getStatusCode() === 404) {
            throw new NotFoundHttpException('Patient introuvable.');
        }

        $status = $response->getStatusCode();
        $content = $response->getContent(false); // get body even if error

        if ($status !== 200) {
            throw new \RuntimeException(
                'patient-service error '.$status.' : '.$content
            );
        }

        $data = $response->toArray(false);

        return (int) $data['idUser'];
    }
}
