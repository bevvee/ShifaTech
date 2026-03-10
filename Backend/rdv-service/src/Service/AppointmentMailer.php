<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use App\Entity\RendezVous;

class AppointmentMailer
{
    public function __construct(private MailerInterface $mailer) {}

    public function sendConfirmation(string $emailAddress, RendezVous $rdv): void
    {
        $html = '
        <html>
        <body style="font-family:Arial;background:#f4f6f9;padding:30px">

        <h2>Rendez-vous Confirmé</h2>

        <p>Votre rendez-vous a été planifié avec succès.</p>

        <p><strong>Date:</strong> '.$rdv->getDateRdv()->format('d/m/Y').'</p>
        <p><strong>Heure:</strong> '.$rdv->getHeureDebut()->format('H:i').'</p>
        <p><strong>ID Docteur:</strong> '.$rdv->getIdDocteur().'</p>

        <p>Merci d\'arriver 10 minutes avant votre rendez-vous.</p>

        <br>

        <strong>Équipe ShifaTech</strong>

        </body>
        </html>
        ';

        $email = (new Email())
            ->from('noreply@shifatech.local')
            ->to($emailAddress)
            ->subject('Confirmation de rendez-vous')
            ->html($html);

        $this->mailer->send($email);
    }
}
