<?php

namespace App\Provider;

use App\Entity\Infirmier;
use App\Repository\InfirmierRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Security\User\PayloadAwareUserProviderInterface;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;

class JwtUserProvider implements PayloadAwareUserProviderInterface
{
    public function __construct(private InfirmierRepository $infirmierRepository) {}

    public function loadUserByIdentifierAndPayload(string $identifier, array $payload): UserInterface
    {
        error_log('=== JWT PAYLOAD ===');
        error_log(json_encode($payload));
        error_log('identifier: ' . $identifier);

        $userId = $payload['userId'] ?? null;
        error_log('userId extrait: ' . $userId);

        if (!$userId) {
            error_log('ERREUR: userId absent du payload');
            throw new UserNotFoundException('userId absent du token JWT');
        }

        $infirmier = $this->infirmierRepository->findOneBy(['id_utilisateur' => $userId]);
        error_log('infirmier trouvé: ' . ($infirmier ? 'OUI id='.$infirmier->getId() : 'NON'));

        if (!$infirmier) {
            throw new UserNotFoundException("Aucun infirmier trouvé pour userId: $userId");
        }

        return $infirmier;
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        return $user;
    }

    public function supportsClass(string $class): bool
    {
        return $class === Infirmier::class;
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        throw new \Exception('Méthode non utilisée dans un contexte JWT');
    }
}
