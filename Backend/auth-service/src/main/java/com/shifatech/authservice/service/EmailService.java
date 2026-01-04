package com.shifatech.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetPasswordEmail(String toEmail, String token) {

        log.info("Sending reset password email to {}", toEmail);

        String resetLink = "http://localhost:8082/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@shifatech.com");
        message.setTo(toEmail);
        message.setSubject("Reset your password");
        message.setText("Reset link: " + resetLink);

        mailSender.send(message);

        log.info("Reset password email SENT to {}", toEmail);
    }
}
