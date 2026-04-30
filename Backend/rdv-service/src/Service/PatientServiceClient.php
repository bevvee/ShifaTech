<?php

namespace App\Service;

use App\DTO\PatientSummary;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PatientServiceClient
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack,
        private string $patientServiceUrl = 'http://patient-service:8080'
    ) {}

    public function resolvePatientUserId(int $patientId): int
    {
        $patient = $this->getPatientSummary($patientId);

        if (!$patient) {
            throw new NotFoundHttpException('Patient introuvable.');
        }

        if (!$patient->idUser) {
            throw new \RuntimeException('patient-service response missing idUser.');
        }

        return $patient->idUser;
    }

    public function getPatientSummary(int $patientId): ?PatientSummary
    {
        $response = $this->httpClient->request(
            'GET',
            sprintf('%s/patients/details/%d', $this->patientServiceUrl, $patientId),
            [
                'headers' => $this->buildHeaders(),
                'timeout' => 5,
            ]
        );

        $status = $response->getStatusCode();

        if ($status === 404) {
            return null;
        }

        if ($status !== 200) {
            throw new \RuntimeException(
                'patient-service error '.$status.' : '.$response->getContent(false)
            );
        }

        return PatientSummary::fromApiPayload($response->toArray(false));
    }

    public function getPatient(int $patientId): ?PatientSummary
    {
        return $this->getPatientSummary($patientId);
    }

    private function buildHeaders(): array
    {
        $jwt = $this->requestStack
            ->getCurrentRequest()
            ?->headers
            ->get('Authorization');

        return $jwt ? ['Authorization' => $jwt] : [];
    }
}