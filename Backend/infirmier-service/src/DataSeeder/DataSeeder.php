<?php

namespace App\DataSeeder;

use App\Entity\Infirmier;
use App\Entity\InfirmierSpecialite;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

#[AsEventListener(event: KernelEvents::REQUEST, method: 'onKernelRequest')]
class DataSeeder
{
    private bool $seeded = false;

    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest() || $this->seeded) return;
        $this->seeded = true;

        $existing = $this->em->getRepository(Infirmier::class)->count([]);
        if ($existing > 0) return;

        $this->seed();
    }

    private function seed(): void
    {
        $connection = $this->em->getConnection();

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

        // foreach ($users as $index => $data) {
        //     $id       = $index + 9;
        //     $cin      = 'F' . rand(100000, 999999);
        //     $email    = strtolower($data['prenom'] . '.' . str_replace(' ', '', $data['nom'])) . $id . '@hopital.ma';
        //     $password = password_hash('password123', PASSWORD_BCRYPT);

        //     $connection->executeStatement("
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

        $specialites = [
        
        ];

        $specialiteEntities = [];
        foreach ($specialites as $data) {
            $specialite = new InfirmierSpecialite();
            $specialite->setLabel($data['label']);
            $specialite->setIdService($data['id_service']);
            $specialite->setCreatedAt(new \DateTimeImmutable());
            $this->em->persist($specialite);
            $specialiteEntities[] = $specialite;
        }

        $this->em->flush();

        foreach ($users as $index => $data) {
            $specialite = $specialiteEntities[array_rand($specialiteEntities)];

            $infirmier = new Infirmier();
            $infirmier->setIdUtilisateur($index + 9);
            $infirmier->setIdSpecialite($specialite);
            $infirmier->setIdService($specialite->getIdService());
            $infirmier->setCreatedAt(new \DateTimeImmutable());
            $this->em->persist($infirmier);
        }

        $this->em->flush();
    }
}
