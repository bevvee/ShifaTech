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
    public function doctorHasAppointment($doctorId, $date, $start, $end): bool
    {
        $qb = $this->createQueryBuilder('r');
        $qb->andWhere('r.id_docteur = :doctor')
            ->andWhere('r.date_rdv = :date')
            ->andWhere('r.heure_debut < :end')
            ->andWhere('r.heure_fin > :start')
            ->setParameter('doctor', $doctorId)
            ->setParameter('date', $date)
            ->setParameter('start', $start)
            ->setParameter('end', $end);
        return (bool) $qb->getQuery()->getOneOrNullResult();
    }

    public function countDoctorAppointmentsForDay(int $doctorId, \DateTime $date): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.id_docteur = :doctor')
            ->andWhere('r.date_rdv = :date')
            ->andWhere('r.deleted_at IS NULL')
            ->setParameter('doctor', $doctorId)
            ->setParameter('date', $date->format('Y-m-d'))
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countPatientAppointmentsForDay(int $patientId, \DateTime $date): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.id_patient = :patient')
            ->andWhere('r.date_rdv = :date')
            ->andWhere('r.deleted_at IS NULL')
            ->setParameter('patient', $patientId)
            ->setParameter('date', $date->format('Y-m-d'))
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findCurrentByDoctor(int $idDocteur, \DateTimeImmutable $now): ?RendezVous
{
    return $this->createQueryBuilder('r')
        ->andWhere('r.id_docteur = :doctor')
        ->andWhere('r.date_rdv = :today')
        ->andWhere('r.heure_debut <= :nowTime')
        ->andWhere('r.heure_fin >= :nowTime')
        ->setParameter('doctor', $idDocteur)
        ->setParameter('today', $now->format('Y-m-d'))
        ->setParameter('nowTime', $now->format('H:i:s'))
        ->orderBy('r.heure_debut', 'ASC')
        ->setMaxResults(1)
        ->getQuery()
        ->getOneOrNullResult();
}

public function findCurrentByPatient(int $idPatient, \DateTimeImmutable $now): ?RendezVous
{
    return $this->createQueryBuilder('r')
        ->andWhere('r.id_patient = :idPatient')
        ->andWhere('r.date_rdv = :today')
        ->andWhere('r.heure_debut <= :currentTime')
        ->andWhere('r.heure_fin >= :currentTime')
        ->andWhere('r.statut = :statut')
        ->setParameter('idPatient', $idPatient)
        ->setParameter('today', $now->format('Y-m-d'))
        ->setParameter('currentTime', $now->format('H:i:s'))
        ->setParameter('statut', 'CONFIRME')
        ->setMaxResults(1)
        ->getQuery()
        ->getOneOrNullResult();
}
}
