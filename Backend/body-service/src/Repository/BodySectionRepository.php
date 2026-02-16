<?php

namespace App\Repository;

use App\Entity\BodySection;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BodySectionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, BodySection::class);
    }

    public function findAllWithParts(): array
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.parts', 'p')
            ->addSelect('p')
            ->orderBy('s.order', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findSectionWithPart(string $sectionCode, string $partCode): ?BodySection
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.parts', 'p')
            ->addSelect('p')
            ->where('s.code = :section')
            ->andWhere('p.code = :part')
            ->setParameter('section', $sectionCode)
            ->setParameter('part', $partCode)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByCode(string $sectionCode): ?BodySection
    {
        return $this->findOneBy(['code' => $sectionCode]);
    }
}
