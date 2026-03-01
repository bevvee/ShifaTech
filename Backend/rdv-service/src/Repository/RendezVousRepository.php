<?php

namespace App\Repository;

use App\Entity\RendezVous;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\QueryBuilder;


/**
 * @extends ServiceEntityRepository<RendezVous>
 */
class RendezVousRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RendezVous::class);
    }

    public function createQueryBuilder($alias, $indexBy = null): QueryBuilder
    {
        return parent::createQueryBuilder($alias, $indexBy)
            ->andWhere(sprintf('%s.deleted_at IS NULL', $alias));
    }
    public function doctorHasAppointment(int $doctorId, \DateTime $date, \DateTime $time): bool
    {
        return (bool) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.id_docteur = :doctor')
            ->andWhere('r.date_rdv = :date')
            ->andWhere('r.heure_rdv = :time')
            ->andWhere('r.deleted_at IS NULL')
            ->setParameter('doctor', $doctorId)
            ->setParameter('date', $date)
            ->setParameter('time', $time)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countDoctorAppointmentsForDay(int $doctorId, \DateTime $date): int
    {
        $startOfDay = (clone $date)->setTime(0, 0, 0);
        $endOfDay = (clone $date)->setTime(23, 59, 59);

        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.id_docteur = :doctor')
/*            ->andWhere('r.date_rdv BETWEEN :start AND :end')*/
            ->andWhere('r.date_rdv = :date')
            ->andWhere('r.heure_rdv = :time')
            ->andWhere('r.deleted_at IS NULL')
            ->setParameter('doctor', $doctorId)
            ->setParameter('start', $startOfDay)
            ->setParameter('end', $endOfDay)
            ->getQuery()
            ->getSingleScalarResult();
    }

//    /**
//     * @return RendezVous[] Returns an array of RendezVous objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('r.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?RendezVous
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
