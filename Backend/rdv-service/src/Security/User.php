<?php

namespace App\Security;

use Symfony\Component\Security\Core\User\UserInterface;

class User implements UserInterface
{
    private string $userIdentifier;
    private array $roles;

    public function __construct(string $userIdentifier, array $roles = [])
    {
        $this->userIdentifier = $userIdentifier;
        $this->roles = $roles;
    }

    public function getUserIdentifier(): string
    {
        return $this->userIdentifier;
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function eraseCredentials(): void {}
}
