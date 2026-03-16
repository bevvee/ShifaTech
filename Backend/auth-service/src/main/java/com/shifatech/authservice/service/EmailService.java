package com.shifatech.authservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.Year;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetPasswordEmail(String toEmail, String token) {

        log.info("Sending reset password email to {}", toEmail);

        String resetLink = "http://localhost:8082/reset-password?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("no-reply@shifatech.com");
            helper.setTo(toEmail);
            helper.setSubject("Réinitialisation de votre mot de passe");

            int year = Year.now().getValue();

            String htmlContent = "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<body style=\"margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;\">\n" +
                    "\n" +
                    "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f4f6f9;padding:40px 0;\">\n" +
                    "<tr>\n" +
                    "<td align=\"center\">\n" +
                    "\n" +
                    "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);\">\n" +
                    "\n" +
                    "<!-- Header -->\n" +
                    "<tr>\n" +
                    "<td style=\"background:#3CA169;padding:20px;text-align:center;\">\n" +
                    "<h1 style=\"color:#ffffff;margin:0;font-size:22px;\">ShifaTech</h1>\n" +
                    "</td>\n" +
                    "</tr>\n" +
                    "\n" +
                    "<!-- Content -->\n" +
                    "<tr>\n" +
                    "<td style=\"padding:30px;color:#333333;\">\n" +
                    "\n" +
                    "<h2 style=\"margin-top:0;color:#111827;\">Réinitialisation de mot de passe</h2>\n" +
                    "\n" +
                    "<p style=\"font-size:15px;line-height:1.6;\">\n" +
                    "        Vous avez demandé la réinitialisation de votre mot de passe.\n" +
                    "</p>\n" +
                    "\n" +
                    "<div style=\"margin:30px 0;text-align:center;\">\n" +
                    "<a href=\"" + resetLink + "\" style=\"background:#3CA169;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;\">Réinitialiser mon mot de passe</a>\n" +
                    "</div>\n" +
                    "\n" +
                    "<p style=\"font-size:14px;color:#374151;\">\n" +
                    "        Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.\n" +
                    "</p>\n" +
                    "\n" +
                    "<p style=\"margin-top:30px;font-size:14px;\">\n" +
                    "Cordialement,<br>\n" +
                    "<strong>Équipe ShifaTech</strong>\n" +
                    "</p>\n" +
                    "\n" +
                    "</td>\n" +
                    "</tr>\n" +
                    "\n" +
                    "<!-- Footer -->\n" +
                    "<tr>\n" +
                    "<td style=\"background:#f3f4f6;padding:15px;text-align:center;font-size:12px;color:#6b7280;\">\n" +
                    "© " + year + " ShifaTech. Tous droits réservés.\n" +
                    "</td>\n" +
                    "</tr>\n" +
                    "\n" +
                    "</table>\n" +
                    "\n" +
                    "</td>\n" +
                    "</tr>\n" +
                    "</table>\n" +
                    "\n" +
                    "</body>\n" +
                    "</html>";

            helper.setText(htmlContent, true);

            mailSender.send(message);

            log.info("Reset password email SENT to {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send reset password email to {}", toEmail, e);
            throw new RuntimeException("Failed to send reset password email", e);
        }
    }
}
