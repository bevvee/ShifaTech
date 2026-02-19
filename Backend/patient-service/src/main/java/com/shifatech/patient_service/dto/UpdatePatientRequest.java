package com.shifatech.patient_service.dto;

<<<<<<< HEAD
=======
import jakarta.validation.constraints.Size;
>>>>>>> ddc2623 (feat: restructure patient medical data and clean up entity fields)
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientRequest {
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

    private Boolean statut;
}
>>>>>>> ddc2623 (feat: restructure patient medical data and clean up entity fields)
