package com.example.adminservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async("emailTaskExecutor")
    public void sendEmail(String to, String subject, String text) {
        if (to == null || to.isBlank()) {
            log.warn("[EMAIL] Envoi annulé — destinataire vide");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("[ShifaTech] " + subject);
            message.setText(text);
            mailSender.send(message);
            log.info("[EMAIL] E-mail envoyé avec succès à [{}] | Sujet : {}", to, subject);
        } catch (Exception e) {
            log.error("[EMAIL] Échec de l'envoi à [{}] | Erreur : {}", to, e.getMessage(), e);
        }
    }

    /** Envoi synchrone pour le test SMTP — propage l'exception si échec. */
    public void sendEmailSync(String to, String subject, String text) {
        log.info("[EMAIL-TEST] Envoi synchrone vers [{}]", to);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("[ShifaTech] " + subject);
        message.setText(text);
        mailSender.send(message);
        log.info("[EMAIL-TEST] Succès → [{}]", to);
    }
}
