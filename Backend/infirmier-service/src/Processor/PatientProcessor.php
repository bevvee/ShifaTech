<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PatientProcessor implements ProcessorInterface
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
        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        try {
            $response = $this->httpClient->request(
                'POST',
                'http://auth-service:8080/register',
                [
                    'headers' => array_merge($headers, ['Content-Type' => 'application/json']),
                    'body' => json_encode([
                        'nom' => $data->nom,
                        'prenom' => $data->prenom,
                        'cin' => $data->cin,
                        'email' => $data->email,
                        'password' => $data->password,
                        'passwordConfirmation' => $data->password_confirmation,
                        'role' => 'PATIENT',
                        'sexe' => $data->sexe,
                        'dateNaissance' => $data->date_naissance,
                        'telephone' => $data->telephone,
                        'adresse' => $data->adresse,
                    ])
                ]
            );

           $content = $response->toArray(false); // false = ne pas lever d'exception sur 4xx

            if ($content['error'] ?? false) {
                throw new BadRequestHttpException($content['message'] ?? 'Erreur lors de la création du patient');
            }

            $data->id = $content['user']['idUser'] ?? null;
            return $data;

        } catch (BadRequestHttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new BadRequestHttpException('Erreur auth-service : ' . $e->getMessage());
        }
    }
}
