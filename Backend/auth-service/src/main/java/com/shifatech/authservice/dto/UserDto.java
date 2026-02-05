package com.shifatech.authservice.dto;
import com.shifatech.authservice.entity.User;
import lombok.Data;

@Data
public class UserDto {
    private Integer idUser;
    private String nom;
    private String prenom;
    private String cin;
    private String email;
    private String role;
    private String sexe;
    private Boolean statut;
    private String dateNaissance;
    private String telephone;
    private String adresse;


    public UserDto toUserDto(User user) {

        UserDto dto = new UserDto();

        dto.setIdUser(user.getIdUser());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setCin(user.getCin());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setSexe(user.getSexe().name());
        dto.setStatut(user.getStatut());
        dto.setDateNaissance(user.getDateNaissance().toString());
        dto.setTelephone(user.getTelephone());
        dto.setAdresse(user.getAdresse());
        return dto;

    }
}