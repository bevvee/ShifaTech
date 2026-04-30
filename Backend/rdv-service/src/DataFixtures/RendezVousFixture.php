<?php

namespace App\DataFixtures;

use App\Entity\RendezVous;
use App\Enum\StatutEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class RendezVousFixture extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create();

        for ($i = 0; $i < 200; $i++) {

            $rdv = new RendezVous();

            $date = $faker->dateTimeBetween('-1 month', '+1 month');
            $time = $faker->dateTimeBetween('08:00', '17:00');
            $heureDebut = clone $time;
            $heureFin = clone $time;
            $heureFin->modify('+1 hour');

            $rdv
                ->setIdPatient($faker->numberBetween(1, 20))
                ->setIdDocteur($faker->numberBetween(1, 5))
                ->setDateRdv($date)
                ->setHeureDebut($heureDebut)
                ->setHeureFin($heureFin)
                ->setStatut($faker->randomElement([
                    StatutEnum::EN_ATTENTE,
                    StatutEnum::CONFIRME,
                    StatutEnum::ANNULE,
                    StatutEnum::TERMINE,
                ]))
                ->setCreatedAt(new \DateTimeImmutable())
                ->setCreatedBy(1);

            $manager->persist($rdv);
        }

        $manager->flush();
    }
}
