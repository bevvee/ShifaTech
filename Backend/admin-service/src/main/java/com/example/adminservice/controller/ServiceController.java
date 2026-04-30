package com.example.adminservice.controller;

import com.example.adminservice.dto.CreateServiceSFRequest;
import com.example.adminservice.dto.UpdateServiceSFRequest;
import com.example.adminservice.entity.ServiceSF;
import com.example.adminservice.service.ServiceSFEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceSFEntity serviceSFEntity;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceSF create(@Valid @RequestBody CreateServiceSFRequest request) {
        return serviceSFEntity.create(request);
    }

    @GetMapping
    public List<ServiceSF> getAll() {
        return serviceSFEntity.getAll();
    }

    @GetMapping("/{id}")
    public ServiceSF getById(@PathVariable Integer id) {
        return serviceSFEntity.getById(id);
    }

    @PutMapping("/{id}")
    public ServiceSF update(@PathVariable Integer id, @RequestBody UpdateServiceSFRequest request) {
        return serviceSFEntity.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        serviceSFEntity.delete(id);
    }
}