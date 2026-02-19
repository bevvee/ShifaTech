package com.shifatech.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

<<<<<<< HEAD
=======
import java.time.LocalDateTime;

>>>>>>> ddc2623 (feat: restructure patient medical data and clean up entity fields)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {

    private Long idPatient;
    private Long idUser;
    private String numDossier;
<<<<<<< HEAD
    private Double poids;
    private Double taille;
=======
    private String assurance;
    private String numeroAssurance;
    private Boolean statut;
    private LocalDateTime createdAt;

    // Informations de l'utilisateur (provenant du service Auth)
    private UserDTO userInfo;
>>>>>>> ddc2623 (feat: restructure patient medical data and clean up entity fields)
}