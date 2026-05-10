package com.example.adminservice.controller;

import com.example.adminservice.dto.CreateServiceSFRequest;
import com.example.adminservice.dto.UpdateServiceSFRequest;
import com.example.adminservice.entity.ServiceSF;
import com.example.adminservice.service.ServiceSFService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceSFService serviceSFService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceSF create(@Valid @RequestBody CreateServiceSFRequest request) {
        return serviceSFService.create(request);
    }

    @GetMapping
    public List<ServiceSF> getAll() {
        return serviceSFService.getAll();
    }

    @GetMapping("/{id}")
    public ServiceSF getById(@PathVariable Integer id) {
        return serviceSFService.getById(id);
    }

    @PutMapping("/{id}")
    public ServiceSF update(@PathVariable Integer id, @RequestBody UpdateServiceSFRequest request) {
        return serviceSFService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        serviceSFService.delete(id);
    }
}