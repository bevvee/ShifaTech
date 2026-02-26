<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Security\User\PayloadAwareUserProviderInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class JwtUserProvider implements PayloadAwareUserProviderInterface
{
    public function loadUserByIdentifierAndPayload(string $identifier, array $payload): UserInterface
    {
        // Extract email for display (optional)
        $email = $payload['email'] ?? $identifier;

        // Extract role - your token has "role" (singular), not "roles"
        $role = $payload['role'] ?? 'USER';

        // Convert to Symfony role format (ROLE_ prefix)
        $roles = ['ROLE_' . strtoupper($role)];

        return new User($email, $roles);
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
