package com.shifatech.authservice.dto;
import lombok.Data;

@Data
public class UserDto {
    private Integer idUser;
    private String fullName;
    private String email;
    private String role;
}
