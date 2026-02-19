package com.ShifaTech.DoctorService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "APPOINTMENT-SERVICE", url = "${application.config.appointment-service-url}")
public interface AppointmentClient {

    @GetMapping("/appointments")
    List<Object> getAppointmentsByDoctor(@RequestParam("doctorId") Long doctorId); // Using Object as placeholder for
                                                                                   // generic RDV struct
}
