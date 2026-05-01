<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Contract\AuthServiceClientInterface;
use App\Entity\Infirmier;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class DeleteInfirmierProcessor implements ProcessorInterface
{
    public function __construct(
        private AuthServiceClientInterface $authServiceClient,
        private EntityManagerInterface $entityManager,
        private RequestStack $requestStack,
        private LoggerInterface $logger,
    ) {}

    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ): mixed {
        $infirmier = $this->entityManager->find(Infirmier::class, $uriVariables['id']);
        if ($infirmier === null) {
            return null;
        }

        $authHeader = $this->requestStack->getCurrentRequest()
            ?->headers->get('Authorization', '') ?? '';

        if (!$this->authServiceClient->deleteUser($infirmier->getIdUtilisateur(), $authHeader)) {
            $this->logger->error(
                'Suppression bloquée : auth-service a échoué pour l\'utilisateur {userId}',
                [
                    'userId'      => $infirmier->getIdUtilisateur(),
                    'infirmierId' => $infirmier->getId(),
                ]
            );
            throw new BadRequestHttpException(
                'Suppression impossible : auth-service indisponible. Aucune donnée modifiée.'
            );
        }

        $infirmier->setDeletedAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        return null;
    }
}
