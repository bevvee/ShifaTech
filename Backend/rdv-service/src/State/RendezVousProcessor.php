<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Service\AppointmentMailer;
use App\Service\AppointmentValidator;
use App\Service\AuthServiceClient;
use App\Service\DoctorServiceClient;
use App\Service\PatientServiceClient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use App\Entity\RendezVous;

class RendezVousProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
        private AppointmentValidator $validator,
        private PatientServiceClient $patientClient,
        private DoctorServiceClient $doctorClient,
        private AuthServiceClient $authClient,
        private AppointmentMailer $mailer
    ) {}

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if (!$data instanceof RendezVous) {
            return $data;
        }

        $user = $this->security->getUser();
        $roles = $user?->getRoles() ?? [];
        $userId = (int) $user?->getUserIdentifier();

        $patientUserId = null;

        /*
        |-------------------------------------------------
        | 1️⃣ Determine Patient
        |-------------------------------------------------
        */

        if (in_array('ROLE_PATIENT', $roles)) {

            // Patient creates appointment for himself
            $data->setIdPatient($userId);
            $patientUserId = $userId;

        } else {

            // Infirmier/Admin must provide patient ID
            if (!$data->getIdPatient()) {
                throw new BadRequestHttpException('Patient requis.');
            }

            // Resolve patient userId from patient-service
            $patientUserId = $this->patientClient->resolvePatientUserId(
                $data->getIdPatient()
            );
        }

        /*
        |-------------------------------------------------
        | 2️⃣ Verify Doctor Exists
        |-------------------------------------------------
        */

        $this->doctorClient->verifyDoctorExists($data->getIdDocteur());

        /*
        |-------------------------------------------------
        | 3️⃣ Validate Business Rules
        |-------------------------------------------------
        */

        $this->validator->validate($data);

        /*
        |-------------------------------------------------
        | 4️⃣ Audit Fields
        |-------------------------------------------------
        */

        $data->setCreatedAt(new \DateTimeImmutable());
        $data->setCreatedBy($userId);

        /*
        |-------------------------------------------------
        | 5️⃣ Save RDV
        |-------------------------------------------------
        */

        $this->em->persist($data);
        $this->em->flush();

        $doctorName = $this->doctorClient->getDoctorFullName(
            $data->getIdDocteur()
        );
        /*
        |-------------------------------------------------
        | 6️⃣ Send Email Confirmation
        |-------------------------------------------------
        */

        $email = $this->authClient->getUserEmail($patientUserId);

        if ($email) {
            $this->mailer->sendConfirmation($email, $data, $doctorName);
        }

        return $data;
    }
}
