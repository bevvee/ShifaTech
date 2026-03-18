<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Infirmier;
use App\Entity\InfirmierSpecialite;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class InfirmierProcessor implements ProcessorInterface
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private RequestStack $requestStack,
        private EntityManagerInterface $entityManager
    ) {}

    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ) {
        $method = $operation->getMethod();
        $authHeader = $this->requestStack->getCurrentRequest()?->headers->get('Authorization');
        $headers = $authHeader ? ['Authorization' => $authHeader] : [];

        if ($method === 'POST') {
            // Vérifier id_utilisateur dans auth-service
            try {
                $response = $this->httpClient->request(
                    'GET',
                    'http://auth-service:8080/user/' . $data->id_utilisateur,
                    ['headers' => $headers]
                )->toArray();

                if ($response['error'] ?? true) {
                    throw new BadRequestHttpException('Utilisateur introuvable');
                }

                $role = $response['user']['role'] ?? null;
                if ($role !== 'INFIRMIER') {
                    throw new BadRequestHttpException('Cet utilisateur n\'a pas le rôle INFIRMIER, rôle actuel : ' . $role);
                }
            } catch (BadRequestHttpException $e) {
                throw $e;
            } catch (\Exception $e) {
                throw new BadRequestHttpException('Utilisateur introuvable : ' . $data->id_utilisateur);
            }
            $existingInfirmier = $this->entityManager->getRepository(Infirmier::class)
                ->findOneBy(['id_utilisateur' => $data->id_utilisateur]);

            if ($existingInfirmier) {
                throw new BadRequestHttpException('Un infirmier existe déjà avec cet id_utilisateur : ' . $data->id_utilisateur);
            }
            $infirmier = new Infirmier();
            $infirmier->setIdUtilisateur($data->id_utilisateur);

            if ($data->id_specialite) {
               $idSpecialite = (int) basename($data->id_specialite);
                $specialite = $this->entityManager->getReference(
                    InfirmierSpecialite::class,
                    $idSpecialite
                );
                $infirmier->setIdSpecialite($specialite);
            }

            $this->entityManager->persist($infirmier);
            $this->entityManager->flush();

            $data->id = $infirmier->getId();
            return $data;
        }

        if ($method === 'PUT') {
            $infirmier = $this->entityManager->find(Infirmier::class, $uriVariables['id']);
            if (!$infirmier) throw new BadRequestHttpException('Infirmier introuvable');

            // Lire le body brut — $data->nom etc. sont null en PUT !
            $request = $this->requestStack->getCurrentRequest();
            $rawData = json_decode($request->getContent(), true) ?? [];
            error_log('RAW DATA PUT: ' . json_encode($rawData));

            try {
                $updateData = array_filter([
                    'nom'           => $rawData['nom'] ?? null,
                    'prenom'        => $rawData['prenom'] ?? null,
                    'cin'           => $rawData['cin'] ?? null,
                    'email'         => $rawData['email'] ?? null,
                    'sexe'          => $rawData['sexe'] ?? null,
                    'statut'        => $rawData['statut'] ?? null,
                    'dateNaissance' => $rawData['dateNaissance'] ?? null,
                    'telephone'     => $rawData['telephone'] ?? null,
                    'adresse'       => $rawData['adresse'] ?? null,
                    'password'      => $rawData['password'] ?? null,
                ], fn($v) => $v !== null);

                error_log('UPDATE DATA vers auth-service: ' . json_encode($updateData));

                if (!empty($updateData)) {
                    $statusCode = $this->httpClient->request(
                        'PUT',
                        'http://auth-service:8080/update/' . $infirmier->getIdUtilisateur(),
                        [
                            'headers' => array_merge($headers, ['Content-Type' => 'application/json']),
                            'json' => $updateData
                        ]
                    )->getStatusCode();
                    error_log('AUTH SERVICE STATUS: ' . $statusCode);
                }
            } catch (\Exception $e) {
                error_log('Auth-service error: ' . $e->getMessage());
            }

            if (!empty($rawData['id_specialite'])) {
                $id_specialite = (int) basename($rawData['id_specialite']);
                $specialite = $this->entityManager->getReference(InfirmierSpecialite::class, $id_specialite);
                $infirmier->setIdSpecialite($specialite);
            }

            $this->entityManager->flush();
            $data->id = $infirmier->getId();
            return $data;
        }

        if ($method === 'DELETE') {
            $infirmier = $this->entityManager->find(Infirmier::class, $uriVariables['id']);
            if ($infirmier) {
                // Supprimer l'utilisateur dans auth-service
                try {
                    $this->httpClient->request(
                        'DELETE',
                        'http://auth-service:8080/delete/' . $infirmier->getIdUtilisateur(),
                        ['headers' => $headers]
                    )->getStatusCode();
                } catch (\Exception $e) {
                    // Continue même si auth-service échoue
                }

                $this->entityManager->remove($infirmier);
                $this->entityManager->flush();
            }
            return null;
        }

        return null;
    }
}
