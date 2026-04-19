<?php

namespace App\DataFixtures;

use App\Entity\Infirmier;
use App\Entity\InfirmierSpecialite;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\DBAL\Connection;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class AppFixtures extends Fixture
{
    public function __construct(
        #[Autowire(service: 'doctrine.dbal.auth_connection')]
        private Connection $authConnection
    ) {}

    public function load(ObjectManager $manager): void
    {
        $users = [
            ['nom' => 'Alaoui',   'prenom' => 'Youssef', 'sexe' => 'M', 'dob' => '1990-03-15'],
            ['nom' => 'Bennani',  'prenom' => 'Fatima',  'sexe' => 'F', 'dob' => '1988-07-22'],
            ['nom' => 'Chraibi',  'prenom' => 'Omar',    'sexe' => 'M', 'dob' => '1992-11-05'],
            ['nom' => 'Douiri',   'prenom' => 'Amina',   'sexe' => 'F', 'dob' => '1985-01-30'],
            ['nom' => 'El Fassi', 'prenom' => 'Karim',   'sexe' => 'M', 'dob' => '1993-06-18'],
            ['nom' => 'Filali',   'prenom' => 'Nadia',   'sexe' => 'F', 'dob' => '1991-09-25'],
            ['nom' => 'Gharbi',   'prenom' => 'Hassan',  'sexe' => 'M', 'dob' => '1987-04-12'],
            ['nom' => 'Hajji',    'prenom' => 'Samira',  'sexe' => 'F', 'dob' => '1994-02-08'],
            ['nom' => 'Idrissi',  'prenom' => 'Rachid',  'sexe' => 'M', 'dob' => '1989-12-20'],
            ['nom' => 'Jalil',    'prenom' => 'Houda',   'sexe' => 'F', 'dob' => '1996-05-14'],
            ['nom' => 'Karimi',   'prenom' => 'Amine',   'sexe' => 'M', 'dob' => '1990-08-03'],
            ['nom' => 'Lahlou',   'prenom' => 'Zineb',   'sexe' => 'F', 'dob' => '1986-10-27'],
            ['nom' => 'Mansouri', 'prenom' => 'Tariq',   'sexe' => 'M', 'dob' => '1993-03-09'],
            ['nom' => 'Naciri',   'prenom' => 'Leila',   'sexe' => 'F', 'dob' => '1991-07-16'],
            ['nom' => 'Ouali',    'prenom' => 'Mehdi',   'sexe' => 'M', 'dob' => '1988-01-23'],
            ['nom' => 'Qadiri',   'prenom' => 'Salma',   'sexe' => 'F', 'dob' => '1995-11-11'],
            ['nom' => 'Rahimi',   'prenom' => 'Bilal',   'sexe' => 'M', 'dob' => '1992-04-07'],
            ['nom' => 'Saidi',    'prenom' => 'Meryem',  'sexe' => 'F', 'dob' => '1987-06-30'],
            ['nom' => 'Tazi',     'prenom' => 'Hamza',   'sexe' => 'M', 'dob' => '1994-09-19'],
            ['nom' => 'Ziani',    'prenom' => 'Hajar',   'sexe' => 'F', 'dob' => '1990-12-04'],
        ];

        $phones = [
            '0661234567', '0672345678', '0683456789', '0694567890',
            '0651234567', '0662345678', '0673456789', '0684567890',
            '0695678901', '0656789012', '0667890123', '0678901234',
            '0689012345', '0690123456', '0651234568', '0662345679',
            '0673456780', '0684567891', '0695678902', '0656789013',
        ];

        // 1. Insérer les users dans authdb
        // foreach ($users as $index => $data) {
        //     $id       = $index + 9;
        //     $cin      = 'F' . rand(100000, 999999);
        //     $email    = strtolower($data['prenom'] . '.' . str_replace(' ', '', $data['nom'])) . $id . '@hopital.ma';
        //     $password = password_hash('password123', PASSWORD_BCRYPT);

        //     $this->authConnection->executeStatement("
        //         INSERT INTO users
        //             (id_user, cin, nom, prenom, email, mot_de_passe, role, telephone, adresse, date_naissance, sexe, statut, created_at)
        //         VALUES
        //             (:id, :cin, :nom, :prenom, :email, :password, 'INFIRMIER', :tel, :adresse, :dob, :sexe, 1, NOW())
        //         ON DUPLICATE KEY UPDATE id_user = id_user
        //     ", [
        //         'id'       => $id,
        //         'cin'      => $cin,
        //         'nom'      => $data['nom'],
        //         'prenom'   => $data['prenom'],
        //         'email'    => $email,
        //         'password' => $password,
        //         'tel'      => $phones[$index],
        //         'adresse'  => 'Casablanca, Maroc',
        //         'dob'      => $data['dob'],
        //         'sexe'     => $data['sexe'],
        //     ]);
        // }

        // 2. Créer les spécialités dans infirmierdb
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

        $manager->flush();

        // 3. Créer les infirmiers dans infirmierdb
        foreach ($users as $index => $data) {
            $specialite = $specialiteEntities[array_rand($specialiteEntities)];

            $infirmier = new Infirmier();
            $infirmier->setIdUtilisateur($index + 9);
            $infirmier->setIdSpecialite($specialite);
            $infirmier->setIdService($specialite->getIdService());
            $infirmier->setCreatedAt(new \DateTimeImmutable());
            $manager->persist($infirmier);
        }

        $manager->flush();
    }
}
