<?php

namespace App\Provider;

use App\Security\SecurityUser;
use Lexik\Bundle\JWTAuthenticationBundle\Security\User\PayloadAwareUserProviderInterface;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;

class JwtUserProvider implements PayloadAwareUserProviderInterface
{
    // Plus besoin d'InfirmierRepository ici !

    public function loadUserByIdentifierAndPayload(string $identifier, array $payload): UserInterface
    {
        $userId = $payload['userId'] ?? null;
        $role   = $payload['role']   ?? null;

        if (!$userId || !$role) {
            throw new UserNotFoundException('userId ou role absent du token JWT');
        }

        // Aucune requête BDD — on construit l'utilisateur depuis le token
        return new SecurityUser((int) $userId, 'ROLE_' . strtoupper($role));
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        return $user;
    }

    public function supportsClass(string $class): bool
    {
        return $class === SecurityUser::class;
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        throw new \Exception('Non utilisé dans un contexte JWT stateless');
    }
}
