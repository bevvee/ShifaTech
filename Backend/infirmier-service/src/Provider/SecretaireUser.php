<?php

namespace App\Provider;

use Symfony\Component\Security\Core\User\UserInterface;

class SecretaireUser implements UserInterface
{
    public function __construct(private int $userId) {}

    public function getRoles(): array { return ['ROLE_SECRETAIRE']; }
    public function getUserIdentifier(): string { return (string) $this->userId; }
    public function eraseCredentials(): void {}
}
