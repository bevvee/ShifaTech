<?php

namespace App\Repository;

use App\Entity\Infirmier;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Infirmier>
 */
class InfirmierRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Infirmier::class);
    }

    /**
     * Find all non-deleted infirmiers
     * @return Infirmier[]
     */
    public function findAllActive(): array
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.deleted_at IS NULL')
            ->orderBy('i.id', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find active infirmiers by speciality
     * @return Infirmier[]
     */
    public function findBySpecialityActive(int $specialityId): array
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.id_specialite = :speciality')
            ->andWhere('i.deleted_at IS NULL')
            ->setParameter('speciality', $specialityId)
            ->orderBy('i.id', 'ASC')
            ->getQuery()
            ->getResult();
    }

    //    /**
    //     * @return Infirmier[] Returns an array of Infirmier objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('i')
    //            ->andWhere('i.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('i.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Infirmier
    //    {
    //        return $this->createQueryBuilder('i')
    //            ->andWhere('i.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}

