package com.example.adminservice.service;

import com.example.adminservice.dto.CreateServiceSFRequest;
import com.example.adminservice.dto.UpdateServiceSFRequest;
import com.example.adminservice.entity.ServiceSF;
import com.example.adminservice.exception.ResourceNotFoundException;
import com.example.adminservice.repository.ServiceSFRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceSFService {

    private final ServiceSFRepository serviceSFRepository;

    public ServiceSF create(CreateServiceSFRequest request) {
        ServiceSF serviceEntity = ServiceSF.builder()
                .label(request.getLabel())
                .description(request.getDescription())
                .build();

        return serviceSFRepository.save(serviceEntity);
    }

    public List<ServiceSF> getAll() {
        return serviceSFRepository.findAll();
    }

    public ServiceSF getById(Integer id) {
        return serviceSFRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service non trouvé avec id: " + id));
    }

    public ServiceSF update(Integer id, UpdateServiceSFRequest request) {
        ServiceSF serviceEntity = getById(id);

        if (request.getLabel() != null && !request.getLabel().isBlank()) {
            serviceEntity.setLabel(request.getLabel());
        }

        if (request.getDescription() != null) {
            serviceEntity.setDescription(request.getDescription());
        }

        return serviceSFRepository.save(serviceEntity);
    }

    public void delete(Integer id) {
        ServiceSF serviceEntity = getById(id);
        serviceSFRepository.delete(serviceEntity);
    }
}