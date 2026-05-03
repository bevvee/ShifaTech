<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Contract\AuthServiceClientInterface;
use App\Entity\Infirmier;
use App\Entity\InfirmierSpecialite;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CreateInfirmierProcessor implements ProcessorInterface
{
    public function __construct(
        private AuthServiceClientInterface $authServiceClient,
        private EntityManagerInterface $entityManager,
        private RequestStack $requestStack,
    ) {}

    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ): mixed {
        $authHeader = $this->requestStack->getCurrentRequest()
            ?->headers->get('Authorization', '') ?? '';

        $user = $this->authServiceClient->getUserById($data->id_utilisateur, $authHeader);

        if ($user === null) {
            throw new BadRequestHttpException('Utilisateur introuvable : ' . $data->id_utilisateur);
        }

        if (strtoupper((string) ($user['role'] ?? '')) !== 'INFIRMIER') {
            throw new BadRequestHttpException(
                'Cet utilisateur n\'a pas le rôle INFIRMIER, rôle actuel : ' . ($user['role'] ?? 'inconnu')
            );
        }

        $existing = $this->entityManager->getRepository(Infirmier::class)
            ->findOneBy(['idUtilisateur' => $data->id_utilisateur]);

        if ($existing !== null) {
            throw new BadRequestHttpException(
                'Un infirmier existe déjà avec cet id_utilisateur : ' . $data->id_utilisateur
            );
        }

        $infirmier = new Infirmier();
        $infirmier->setIdUtilisateur($data->id_utilisateur);
        $infirmier->setIdService($data->id_service ?? 0);

        if ($data->id_specialite) {
            $idSpecialite = (int) basename($data->id_specialite);
            $infirmier->setSpecialite(
                $this->entityManager->getReference(InfirmierSpecialite::class, $idSpecialite)
            );
        }

        $infirmier->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($infirmier);
        $this->entityManager->flush();

        $data->id = $infirmier->getId();

        return $data;
    }
}
