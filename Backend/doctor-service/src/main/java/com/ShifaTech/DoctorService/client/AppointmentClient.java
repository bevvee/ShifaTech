package com.ShifaTech.DoctorService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "rdv-service", url = "${application.config.appointment-service-url}")
public interface AppointmentClient {

    @GetMapping("/api/rendez_vouses")
    List<Object> getAppointmentsByDoctor(@RequestParam("id_docteur") Long idDocteur);
}
