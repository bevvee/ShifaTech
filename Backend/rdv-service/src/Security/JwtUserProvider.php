<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Security\User\PayloadAwareUserProviderInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class JwtUserProvider implements PayloadAwareUserProviderInterface
{
    public function loadUserByIdentifierAndPayload(string $identifier, array $payload): UserInterface
    {
        // ✅ Use userId as identifier (important)
        $userId = $payload['userId'] ?? $identifier;

        // Convert single "role" claim into Symfony roles
        $role = $payload['role'] ?? 'USER';
        $roles = ['ROLE_' . strtoupper($role)];

        return new User((string) $userId, $roles);
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
