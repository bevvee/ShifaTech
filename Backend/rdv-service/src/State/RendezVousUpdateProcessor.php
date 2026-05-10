<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use App\Entity\RendezVous;

class RendezVousUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
        private HttpClientInterface $httpClient,
        private LoggerInterface $logger
    ) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof RendezVous) {
            return $data;
        }

        $user = $this->security->getUser();
        $userId = $user?->getUserIdentifier();

        // Set audit fields
        $data->setUpdatedAt(new \DateTimeImmutable());
        $data->setUpdatedBy((int) $userId);

        $this->em->flush();

        try {
            $roles = $user?->getRoles() ?? [];
            $this->httpClient->request('POST', 'http://admin-service:8080/api/admin/events', [
                'json' => [
                    'idRdv'       => $data->getId(),
                    'idPatient'   => $data->getIdPatient(),
                    'idDocteur'   => $data->getIdDocteur(),
                    'idInfirmier' => in_array('ROLE_INFIRMIER', $roles) ? (int) $userId : null,
                    'dateRdv'     => $data->getDateRdv()?->format('Y-m-d') . ' à ' . $data->getHeureDebut()?->format('H:i'),
                    'statut'      => $data->getStatut()->value
                ]
            ]);
        } catch (\Exception $e) {
            $this->logger->error("Impossible de notifier admin-service de la modification du RDV #" . $data->getId() . " : " . $e->getMessage());
        }

        return $data;
    }
}
