<?php

namespace App\EventSubscriber;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTDecodedEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class JwtDebugSubscriber implements EventSubscriberInterface
{
    public function __construct(private LoggerInterface $logger) {}

    public static function getSubscribedEvents(): array
    {
        return [Events::JWT_DECODED => 'onJwtDecoded'];
    }

    public function onJwtDecoded(JWTDecodedEvent $event): void
    {
        $payload = $event->getPayload();

        $this->logger->debug('[JWT_DEBUG] payload reçu', [
            'userId' => $payload['userId'] ?? 'ABSENT',
            'role'   => $payload['role']   ?? 'ABSENT',
            'roles'  => $payload['roles']  ?? 'ABSENT',
            'sub'    => $payload['sub']    ?? 'ABSENT',
        ]);

        if (empty($payload['userId']) && empty($payload['sub'])) {
            $this->logger->error('[JWT_DEBUG] Ni userId ni sub dans le token — authentification va échouer');
        }

        if (empty($payload['role']) && empty($payload['roles'])) {
            $this->logger->error('[JWT_DEBUG] Claim role absent du token — ROLE_USER sera attribué → 403 attendu');
            $event->markAsInvalid();
        }
    }
}
