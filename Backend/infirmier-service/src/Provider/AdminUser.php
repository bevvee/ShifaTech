<?php

namespace App\Provider;

use Symfony\Component\Security\Core\User\UserInterface;

class AdminUser implements UserInterface
{
    public function __construct(private int $userId) {}

    public function getRoles(): array { return ['ROLE_ADMIN']; }
    public function getUserIdentifier(): string { return (string) $this->userId; }
    public function eraseCredentials(): void {}
}
