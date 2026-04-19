package com.example.adminservice.exception;

public class ServiceUnavailableException extends RuntimeException {

    private final String serviceName;

    public ServiceUnavailableException(String serviceName, Throwable cause) {
        super("Service [" + serviceName + "] indisponible : " + cause.getMessage(), cause);
        this.serviceName = serviceName;
    }

    public String getServiceName() {
        return serviceName;
    }
}
