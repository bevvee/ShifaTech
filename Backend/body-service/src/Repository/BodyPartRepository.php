<?php

namespace App\Repository;

use App\Entity\BodyPart;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BodyPartRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, BodyPart::class);
    }

    public function findPartByCodes(string $sectionCode, string $partCode): ?BodyPart
    {
        return $this->createQueryBuilder('p')
            ->join('p.bodySection', 's')
            ->where('s.code = :section')
            ->andWhere('p.code = :part')
            ->setParameter('section', $sectionCode)
            ->setParameter('part', $partCode)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findPartsBySection(string $sectionCode): array
    {
        return $this->createQueryBuilder('p')
            ->join('p.bodySection', 's')
            ->where('s.code = :section')
            ->setParameter('section', $sectionCode)
            ->getQuery()
            ->getResult();
    }
}
