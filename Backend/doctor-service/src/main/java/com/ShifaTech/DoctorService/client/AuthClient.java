package com.ShifaTech.DoctorService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "auth-service", url = "${application.config.auth-service-url}")
public interface AuthClient {

    @GetMapping("/user/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);
}
