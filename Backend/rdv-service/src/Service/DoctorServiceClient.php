<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class DoctorServiceClient
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack
    ) {}

    public function verifyDoctorExists(int $doctorId): void
    {
        $request = $this->requestStack->getCurrentRequest();
        $jwt = $request?->headers->get('Authorization');

        $response = $this->httpClient->request(
            'GET',
            sprintf('http://doctor-service:8080/%d', $doctorId),
            [
                'headers' => [
                    'Authorization' => $jwt
                ]
            ]
        );

        if ($response->getStatusCode() === 404) {
            throw new NotFoundHttpException('Docteur introuvable.');
        }

        if ($response->getStatusCode() !== 200) {
            $content = $response->getContent(false);
            throw new \RuntimeException(
                'doctor-service error '.$response->getStatusCode().' : '.$content
            );
        }
    }


    public function getDoctorFullName(int $doctorId): ?string
    {
        $request = $this->requestStack->getCurrentRequest();
        $jwt = $request?->headers->get('Authorization');

        $response = $this->httpClient->request(
            'GET',
            sprintf('http://doctor-service:8080/%d', $doctorId),
            [
                'headers' => [
                    'Authorization' => $jwt
                ]
            ]
        );

        if ($response->getStatusCode() !== 200) {
            return null;
        }
        $content = $response->getContent(false);
        dump($content);
        die();
        $data = $response->toArray(false);

        $nom = $data['data']['nom'] ?? null;
        $prenom = $data['data']['prenom'] ?? null;

        if (!$nom || !$prenom) {
            return null;
        }

        return $prenom.' '.$nom;
    }
}
