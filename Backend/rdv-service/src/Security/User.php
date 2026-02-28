<?php

namespace App\Security;

use Symfony\Component\Security\Core\User\UserInterface;

class User  implements UserInterface
{
    private string $username;
    private array $roles;

    public function __construct(string $username, array $roles = [])
    {
        $this->username = $username;
        $this->roles = $roles;
    }

    public function getUserIdentifier(): string
    {
        return $this->username;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        // Guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function eraseCredentials(): void
    {
        // Nothing to erase
    }
}
