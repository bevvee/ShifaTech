<?php

namespace App\Contract;

interface AuthServiceClientInterface
{
    /**
     * Retourne les données brutes de l'utilisateur depuis auth-service,
     * ou null si l'utilisateur est introuvable ou si le service est down.
     */
    public function getUserById(int $userId, string $authHeader): ?array;

    /**
     * Met à jour le profil de l'utilisateur dans auth-service.
     * Retourne true si auth-service confirme le succès, false sinon
     * (service down, timeout ou réponse d'erreur métier).
     * Les détails de l'échec sont loggués dans l'implémentation.
     */
    public function updateUser(int $userId, array $data, string $authHeader): bool;

    /**
     * Supprime l'utilisateur dans auth-service.
     * Retourne true si la suppression est confirmée ou si l'utilisateur
     * est déjà absent (idempotent), false en cas d'erreur réseau/transport.
     * Les détails de l'échec sont loggués dans l'implémentation.
     */
    public function deleteUser(int $userId, string $authHeader): bool;
}
