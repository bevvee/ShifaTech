package com.shifatech.patient_service.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.shifatech.patient_service.entity.TypeBlessure;

import java.io.IOException;

/**
 * Custom deserializer to convert empty strings to null for TypeBlessure enum.
 * This prevents Jackson from throwing a coercion error when an empty string
 * is received for the typeBlessure field.
 */
public class EmptyStringToNullDeserializer extends JsonDeserializer<TypeBlessure> {
    @Override
    public TypeBlessure deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        
        // Convert empty strings to null
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        
        // Try to deserialize the value as a TypeBlessure enum
        try {
            return TypeBlessure.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            // If the value doesn't match any enum constant, return null
            return null;
        }
    }
}
