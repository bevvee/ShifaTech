<?php
namespace App\Dto;

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
        if (!in_array('ROLE_USER', $roles, true)) {
            $roles[] = 'ROLE_USER';
        }
        return array_unique($roles);
    }

    public function eraseCredentials(): void {}
}
