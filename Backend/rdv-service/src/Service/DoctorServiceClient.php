<?php

namespace App\Service;

use App\DTO\DoctorSummary;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class DoctorServiceClient
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack,
        private string $doctorServiceUrl = 'http://doctor-service:8080'
    ) {}

    public function verifyDoctorExists(int $idDocteur): void
    {
        $doctor = $this->getDoctorSummary($idDocteur);

        if (!$doctor) {
            throw new NotFoundHttpException('Docteur introuvable.');
        }
    }

    public function getDoctorFullName(int $idDocteur): ?string
    {
        return $this->getDoctorSummary($idDocteur)?->getFullName();
    }

    public function getDoctorSummary(int $idDocteur): ?DoctorSummary
    {
        $response = $this->httpClient->request(
            'GET',
            sprintf('%s/user/%d', $this->doctorServiceUrl, $idDocteur),
            [
                'headers' => $this->getAuthHeaders(),
                'timeout' => 5,
            ]
        );

        $status = $response->getStatusCode();

        if ($status === 404) {
            return null;
        }

        if ($status !== 200) {
            throw new \RuntimeException(
                'doctor-service error '.$status.' : '.$response->getContent(false)
            );
        }

        return DoctorSummary::fromApiPayload($response->toArray(false));
    }

    public function getDoctor(int $idDocteur): ?DoctorSummary
    {
        return $this->getDoctorSummary($idDocteur);
    }

    private function getAuthHeaders(): array
    {
        $jwt = $this->requestStack
            ->getCurrentRequest()
            ?->headers
            ->get('Authorization');

        return $jwt ? ['Authorization' => $jwt] : [];
    }
}