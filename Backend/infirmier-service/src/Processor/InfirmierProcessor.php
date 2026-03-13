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
            $infirmier->setIdService($data->id_service);

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

            if ($data->id_utilisateur) {
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

                    $infirmier->setIdUtilisateur($data->id_utilisateur);
                }
            if ($data->id_service) $infirmier->setIdService($data->id_service);

            if ($data->id_specialite) {
                $id_specialite = (int) basename($data->id_specialite);
                $specialite = $this->entityManager->getReference(
                    InfirmierSpecialite::class,
                    $id_specialite
                );
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
