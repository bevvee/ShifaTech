package com.ShifaTech.DoctorService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class DoctorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoctorServiceApplication.class, args);
        System.out.println("==============================================");
        System.out.println("🚀 DoctorService démarré avec succès!");
        System.out.println("📡 API disponible sur: http://localhost:8080/api/doctors");
        System.out.println("🗄️  phpMyAdmin disponible sur: http://localhost:8081");
        System.out.println("==============================================");
    }

}