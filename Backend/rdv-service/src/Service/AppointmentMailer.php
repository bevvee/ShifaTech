<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use App\Entity\RendezVous;

class AppointmentMailer
{
    public function __construct(private MailerInterface $mailer) {}

    public function sendConfirmation(string $emailAddress, RendezVous $rdv, ?string $doctorName): void    {
        $html = '
            <!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">

<!-- Header -->
<tr>
<td style="background:#3CA169;padding:20px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:22px;">ShifaTech</h1>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:30px;color:#333333;">

<h2 style="margin-top:0;color:#111827;">Rendez-vous confirmé</h2>

<p style="font-size:15px;line-height:1.6;">
        Votre rendez-vous a été planifié avec succès.
</p>

<table width="100%" cellpadding="10" cellspacing="0" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:6px;">
<tr>
<td style="background:#f9fafb;width:40%;"><strong>Date</strong></td>
<td>'.$rdv->getDateRdv()->format('d/m/Y').'</td>
</tr>

<tr>
<td style="background:#f9fafb;"><strong>Heure</strong></td>
<td>'.$rdv->getHeureDebut()->format('H:i').'</td>
</tr>

<tr>
<td style="background:#f9fafb;"><strong>Docteur</strong></td>
<p><strong>Docteur:</strong> Dr. '.$doctorName.'</p></tr>
</table>

<p style="font-size:14px;color:#374151;">
        Merci d\'arriver <strong>10 minutes</strong> avant l\'heure prévue.
</p>

<p style="margin-top:30px;font-size:14px;">
Cordialement,<br>
<strong>Équipe ShifaTech</strong>
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#6b7280;">
© '.date('Y').' ShifaTech. Tous droits réservés.
</td>
</tr>

</table>

</td>
</tr>
</table>

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
