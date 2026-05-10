<?php

namespace App\Processor;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Infirmier;
use App\Entity\InfirmierSpecialite;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class InfirmierProcessor implements ProcessorInterface
{
    public function __construct(
        private Connection $authConnection,
        private RequestStack $requestStack,
        private EntityManagerInterface $entityManager
    ) {
    }

    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ) {
        $method = $operation->getMethod();

        // ─── POST : Création d'un infirmier ───────────────────────────────────
        if ($method === 'POST') {

            // 1. Vérifier que l'utilisateur existe dans auth-db et a le rôle INFIRMIER
            $user = $this->fetchUserFromAuthDb($data->id_utilisateur);

            if ($user === null) {
                throw new BadRequestHttpException('Utilisateur introuvable : ' . $data->id_utilisateur);
            }

            if (strtoupper((string) ($user['role'] ?? '')) !== 'INFIRMIER') {
                throw new BadRequestHttpException(
                    'Cet utilisateur n\'a pas le rôle INFIRMIER, rôle actuel : ' . ($user['role'] ?? 'inconnu')
                );
            }

            // 2. Vérifier doublon (la colonne PHP s'appelle id_utilisateur)
            $existingInfirmier = $this->entityManager->getRepository(Infirmier::class)
                ->findOneBy(['id_utilisateur' => $data->id_utilisateur]);

            if ($existingInfirmier) {
                throw new BadRequestHttpException(
                    'Un infirmier existe déjà avec cet id_utilisateur : ' . $data->id_utilisateur
                );
            }

            // 3. Créer l'entité infirmier
            $infirmier = new Infirmier();
            $infirmier->setIdUtilisateur($data->id_utilisateur);

            if ($data->id_specialite) {
                $idSpecialite = (int) basename($data->id_specialite);
                $specialite = $this->entityManager->getReference(InfirmierSpecialite::class, $idSpecialite);
                $infirmier->setIdSpecialite($specialite);
            }
            $infirmier->setCreatedAt(new \DateTimeImmutable());

            $this->entityManager->persist($infirmier);
            $this->entityManager->flush();

            // 4. Enrichir la ressource retournée avec les données auth-db
            $data->id = $infirmier->getId();
            if ($user) {
                $data->nom = $user['nom'] ?? null;
                $data->prenom = $user['prenom'] ?? null;
                $data->cin = $user['cin'] ?? null;
                $data->email = $user['email'] ?? null;
                $data->sexe = $user['sexe'] ?? null;
                $data->statut = (bool) ($user['statut'] ?? false);
                $data->dateNaissance = $user['date_naissance'] ?? null;
                $data->telephone = $user['telephone'] ?? null;
                $data->adresse = $user['adresse'] ?? null;
            }

            return $data;
        }

        // ─── PUT : Mise à jour ─────────────────────────────────────────────────
        if ($method === 'PUT') {
            $infirmier = $this->entityManager->find(Infirmier::class, $uriVariables['id']);
            if (!$infirmier)
                throw new BadRequestHttpException('Infirmier introuvable');

            $request = $this->requestStack->getCurrentRequest();
            $rawData = json_decode($request->getContent(), true) ?? [];

            // Mise à jour directe dans auth-db
            try {
                $updateFields = array_filter([
                    'nom' => $rawData['nom'] ?? null,
                    'prenom' => $rawData['prenom'] ?? null,
                    'cin' => $rawData['cin'] ?? null,
                    'email' => $rawData['email'] ?? null,
                    'sexe' => $rawData['sexe'] ?? null,
                    'statut' => isset($rawData['statut']) ? (int) $rawData['statut'] : null,
                    'date_naissance' => $rawData['dateNaissance'] ?? null,
                    'telephone' => $rawData['telephone'] ?? null,
                    'adresse' => $rawData['adresse'] ?? null,
                ], fn($v) => $v !== null);

                if (!empty($rawData['motDePasse'])) {
                    // Hachage bcrypt compatible avec Spring Security
                    $updateFields['mot_de_passe'] = password_hash($rawData['motDePasse'], PASSWORD_BCRYPT);
                }

                if (!empty($updateFields)) {
                    $setClauses = implode(', ', array_map(fn($col) => "$col = :$col", array_keys($updateFields)));
                    $updateFields['id'] = $infirmier->getIdUtilisateur();
                    $this->authConnection->executeStatement(
                        "UPDATE users SET $setClauses WHERE id_user = :id AND deleted_at IS NULL",
                        $updateFields
                    );
                }
            } catch (\Exception $e) {
                // L'update auth-db a échoué — on continue quand même pour mettre à jour la spécialité
            }

            // Mise à jour de la spécialité dans infirmier-db
            if (!empty($rawData['id_specialite'])) {
                $idSpecialite = (int) basename($rawData['id_specialite']);
                $specialite = $this->entityManager->getReference(InfirmierSpecialite::class, $idSpecialite);
                $infirmier->setIdSpecialite($specialite);
            }

            $infirmier->setUpdatedAt(new \DateTimeImmutable());
            $this->entityManager->flush();

            $data->id = $infirmier->getId();
            return $data;
        }

        // ─── DELETE : Soft-delete dans auth-db ────────────────────────────────
        if ($method === 'DELETE') {
            $infirmier = $this->entityManager->find(Infirmier::class, $uriVariables['id']);
            if ($infirmier) {
                try {
                    $this->authConnection->executeStatement(
                        'UPDATE users SET deleted_at = NOW() WHERE id_user = :id AND deleted_at IS NULL',
                        ['id' => $infirmier->getIdUtilisateur()]
                    );
                } catch (\Exception $e) {
                    // Soft-delete auth-db échoué — on continue
                }

                $infirmier->setDeletedAt(new \DateTimeImmutable());
                $this->entityManager->flush();
            }
            return null;
        }

        return null;
    }

    /**
     * Récupère un utilisateur depuis auth-db par son ID.
     */
    private function fetchUserFromAuthDb(int $userId): ?array
    {
        try {
            $row = $this->authConnection->fetchAssociative(
                'SELECT id_user, nom, prenom, cin, email, role, sexe, statut, date_naissance, telephone, adresse
                 FROM users
                 WHERE id_user = :id AND deleted_at IS NULL',
                ['id' => $userId]
            );
            return $row ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
