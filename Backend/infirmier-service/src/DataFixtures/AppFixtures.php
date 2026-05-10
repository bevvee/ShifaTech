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
        // 1. Créer les spécialités
        $specialites = [
            ['label' => 'Cardiologie', 'id_service' => 1],
            ['label' => 'Pédiatrie',   'id_service' => 1],
            ['label' => 'Urgences',    'id_service' => 2],
            ['label' => 'Chirurgie',   'id_service' => 2],
            ['label' => 'Sage-femme',  'id_service' => 3],
            ['label' => 'Psychiatrie', 'id_service' => 5],
        ];

        $specialiteEntities = [];
        foreach ($specialites as $data) {
            $specialite = new InfirmierSpecialite();
            $specialite->setLabel($data['label']);
            $specialite->setIdService($data['id_service']);
            $specialite->setCreatedAt(new \DateTimeImmutable());
            $manager->persist($specialite);
            $specialiteEntities[] = $specialite;
        }

        $manager->flush(); // flush spécialités d'abord

        // 2. Vérifier que les spécialités ont bien été insérées
        if (empty($specialiteEntities)) {
            throw new \RuntimeException('Aucune spécialité créée, impossible de créer les infirmiers.');
        }

        // 3. Créer les infirmiers avec id_utilisateur 9 à 13
        for ($i = 0; $i < 20; $i++) {
            $specialite = $specialiteEntities[$i % count($specialiteEntities)];

            $infirmier = new Infirmier();
            $infirmier->setIdUtilisateur($i + 9);
            $infirmier->setIdSpecialite($specialite);
            $infirmier->setCreatedAt(new \DateTimeImmutable());
            $manager->persist($infirmier);
        }

        $manager->flush(); // flush infirmiers
    }
}
