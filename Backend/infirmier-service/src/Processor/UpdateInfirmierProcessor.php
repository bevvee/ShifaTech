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

class UpdateInfirmierProcessor implements ProcessorInterface
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
        $infirmier = $this->entityManager->find(Infirmier::class, $uriVariables['id']);
        if ($infirmier === null) {
            throw new BadRequestHttpException('Infirmier introuvable');
        }

        $request    = $this->requestStack->getCurrentRequest();
        $authHeader = $request?->headers->get('Authorization', '') ?? '';
        $rawData    = json_decode($request->getContent(), true) ?? [];

        $updateData = array_filter([
            'nom'           => $rawData['nom']           ?? null,
            'prenom'        => $rawData['prenom']        ?? null,
            'cin'           => $rawData['cin']           ?? null,
            'email'         => $rawData['email']         ?? null,
            'sexe'          => $rawData['sexe']          ?? null,
            'statut'        => $rawData['statut']        ?? null,
            'dateNaissance' => $rawData['dateNaissance'] ?? null,
            'telephone'     => $rawData['telephone']     ?? null,
            'adresse'       => $rawData['adresse']       ?? null,
            'motDePasse'    => $rawData['motDePasse']    ?? null,
        ], fn($v) => $v !== null);

        if (!empty($updateData)) {
            if (!$this->authServiceClient->updateUser($infirmier->getIdUtilisateur(), $updateData, $authHeader)) {
                throw new BadRequestHttpException('Mise à jour impossible dans auth-service.');
            }
        }

        if (!empty($rawData['id_specialite'])) {
            $idSpecialite = (int) basename($rawData['id_specialite']);
            $infirmier->setSpecialite(
                $this->entityManager->getReference(InfirmierSpecialite::class, $idSpecialite)
            );
        }

        $infirmier->setUpdatedAt(new \DateTimeImmutable());
        $this->entityManager->flush();

        $data->id = $infirmier->getId();

        return $data;
    }
}
