<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Security\User\PayloadAwareUserProviderInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class JwtUserProvider implements PayloadAwareUserProviderInterface
{
    public function loadUserByIdentifierAndPayload(string $identifier, array $payload): UserInterface
    {
        // Extract roles from JWT payload
        $roles = $payload['roles'] ?? $payload['authorities'] ?? ['ROLE_USER'];

        return new User($identifier, $roles);
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        return new User($identifier, ['ROLE_USER']);
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        return $user;
    }

    public function supportsClass(string $class): bool
    {
        return User::class === $class || is_subclass_of($class, User::class);
    }
}
