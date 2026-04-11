<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Security\User\JWTUserInterface;

class SecurityUser implements JWTUserInterface
{
    private string $identifier;
    private array $roles;

    public function __construct(string $identifier, array $roles = [])
    {
        $this->identifier = $identifier;
        $this->roles = $roles;
    }

    /**
     * Crée un utilisateur via le payload du JWT
     */
    public static function createFromPayload($username, array $payload): self
    {
        $role = $payload['role'] ?? $payload['roles'] ?? null;

        if (is_string($role)) {
            $roles = ['ROLE_' . strtoupper($role)];
        } elseif (is_array($role)) {
            $roles = $role;
        } else {
            $roles = ['ROLE_USER'];
        }

        return new self((string) $username, $roles);
    }

    public function getUserIdentifier(): string
    {
        return $this->identifier;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        // Garantie qu'il y a toujours au moins ROLE_USER
        if (!in_array('ROLE_USER', $roles, true)) {
            $roles[] = 'ROLE_USER';
        }

        return array_unique($roles);
    }

    public function eraseCredentials(): void
    {
        // Pas de credentials stockés dans ce cas car architecture sans état (stateless)
    }
}
