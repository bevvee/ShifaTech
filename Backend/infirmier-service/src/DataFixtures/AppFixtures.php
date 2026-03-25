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
        // 5 spécialités avec leurs services
        $specialitesData = [
            ['label' => 'Soins intensifs',   'id_service' => 1],
            ['label' => 'Pédiatrie',          'id_service' => 2],
            ['label' => 'Urgences',           'id_service' => 3],
            ['label' => 'Chirurgie',          'id_service' => 4],
            ['label' => 'Cardiologie',        'id_service' => 5],
            ['label' => 'Neurologie',         'id_service' => 6],
            ['label' => 'Oncologie',          'id_service' => 7],
            ['label' => 'Psychiatrie',        'id_service' => 8],
            ['label' => 'Gériatrie',          'id_service' => 9],
            ['label' => 'Réanimation',        'id_service' => 10],
        ];

        $specialites = [];
        foreach ($specialitesData as $data) {
            $specialite = new InfirmierSpecialite();
            $specialite->setLabel($data['label']);
            $specialite->setIdService($data['id_service']);
            $manager->persist($specialite);
            $specialites[] = $specialite;
        }

        $manager->flush();

        for ($i = 1; $i <= 100; $i++) {
            $infirmier = new Infirmier();
            $infirmier->setIdUtilisateur($i);
            $infirmier->setIdSpecialite($specialites[array_rand($specialites)]);
            $manager->persist($infirmier);
        }

        $manager->flush();
    }
}
