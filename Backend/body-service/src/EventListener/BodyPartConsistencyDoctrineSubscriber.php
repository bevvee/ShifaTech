<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\BodyPart;
use App\Service\BodyPartConsistencyChecker;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;

final class BodyPartConsistencyDoctrineSubscriber implements EventSubscriber
{
    public function __construct(
        private readonly BodyPartConsistencyChecker $checker,
    ) {
    }

    public function getSubscribedEvents(): array
    {
        return [
            Events::prePersist => 'prePersist',
            Events::preUpdate => 'preUpdate',
        ];
    }

    public function prePersist(PrePersistEventArgs $args): void
    {
        $this->validate($args->getObject());
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $this->validate($args->getObject());
    }

    private function validate(object $entity): void
    {
        if ($entity instanceof BodyPart) {
            $this->checker->assertConsistent($entity);
        }
    }
}
