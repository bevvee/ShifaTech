package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientRequest {
    private Long idUser;
    private String numDossier;
    private Double poids;
    private Double taille;
}

<<<<<<< HEAD
=======
    @Size(max = 100, message = "Le nom de l'assurance ne doit pas dépasser 100 caractères")
    private String assurance;

    @Size(max = 50, message = "Le numéro d'assurance ne doit pas dépasser 50 caractères")
    private String numeroAssurance;
}
>>>>>>> ddc2623 (feat: restructure patient medical data and clean up entity fields)
