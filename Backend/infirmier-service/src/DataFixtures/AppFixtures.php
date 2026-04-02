<?php

namespace App\DataFixtures;

use App\Entity\Infirmier;
use App\Entity\InfirmierSpecialite;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $specialites = [
            ['label' => 'Cardiologie',      'id_service' => 1],
            ['label' => 'Pédiatrie',        'id_service' => 1],
            ['label' => 'Urgences',         'id_service' => 2],
            ['label' => 'Chirurgie',        'id_service' => 2],
            ['label' => 'Sage-femme',       'id_service' => 3],
            ['label' => 'Psychiatrie',      'id_service' => 5],
        ];

        $specialiteEntities = [];
        foreach ($specialites as $data) {
            $specialite = new InfirmierSpecialite();
            $specialite->setLabel($data['label']);
            $specialite->setIdService($data['id_service']);
            $manager->persist($specialite);
            $specialiteEntities[] = $specialite;
        }

        $manager->flush();

        for ($i = 1; $i <= 100; $i++) {
            $infirmier = new Infirmier();
            $infirmier->setIdUtilisateur(100 + $i);
            $infirmier->setIdSpecialite($specialiteEntities[array_rand($specialiteEntities)]);
            $infirmier->setCreatedAt(new \DateTimeImmutable());
            $manager->persist($infirmier);

            if ($i % 20 === 0) {
                $manager->flush();
            }
        }

        $manager->flush();
    }
}
