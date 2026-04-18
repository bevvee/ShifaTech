package com.shifatech.authservice.service;

import com.shifatech.authservice.Enum.SexeEnum;
import com.shifatech.authservice.dto.*;
import com.shifatech.authservice.entity.*;
import com.shifatech.authservice.repository.*;
import com.shifatech.authservice.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RevokedTokenRepository revokedTokenRepository;

    // Register with friendly messages
    public ApiResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getPasswordConfirmation())) {
            return new ApiResponse(true, "Le mot de passe et la confirmation ne correspondent pas");
        }

        try {
            User user = new User();
            user.setNom(request.getNom());
            user.setPrenom(request.getPrenom());
            user.setCin(request.getCin());
            user.setEmail(request.getEmail());
            user.setMotDePasse(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole());
            user.setSexe(request.getSexe());
            user.setDateNaissance(request.getDateNaissance());
            user.setTelephone(request.getTelephone());
            user.setAdresse(request.getAdresse());
            user.setStatut(false);

            userRepository.save(user);
            return new ApiResponse(false, "Utilisateur inscrit avec succès", new UserDto().toUserDto(user));

        } catch (DataIntegrityViolationException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof ConstraintViolationException cve) {
                SQLException sqlEx = cve.getSQLException();
                if (sqlEx.getErrorCode() == 1062) {
                    String msg = sqlEx.getMessage();
                    if (msg.contains(request.getEmail())) return new ApiResponse(true, "Cet email est déjà utilisé");
                    if (msg.contains(request.getCin())) return new ApiResponse(true, "Ce CIN est déjà utilisé");
                    if (msg.contains(request.getTelephone())) return new ApiResponse(true, "Ce téléphone est déjà utilisé");
                    return new ApiResponse(true, "Valeur en double trouvée");
                }
            }
            return new ApiResponse(true, "Violation d'intégrité des données");
        } catch (Exception ex) {
            return new ApiResponse(true, "Une erreur s'est produite");
        }
    }

    // Login with friendly messages
    public LoginResponse login(LoginRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);

            if (user == null || user.getDeletedAt() != null) { // check soft delete
                return new LoginResponse(true, "Email ou mot de passe incorrect", null);
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getMotDePasse())) {
                return new LoginResponse(true, "Email ou mot de passe incorrect", null);
            }

            String token = jwtUtil.generateToken(user);
            return new LoginResponse(false, "Connexion réussie", token);

        } catch (Exception ex) {
            return new LoginResponse(true, "Une erreur s'est produite", null);
        }
    }

    // Get user profile
    public ApiResponse getProfile(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return new ApiResponse(true, "Utilisateur non authentifié");
            }

            String token = authHeader.substring(7);

            // Extract userId as Integer
            Integer userId = jwtUtil.extractClaims(token).get("userId", Integer.class);
            if (userId == null) {
                return new ApiResponse(true, "Utilisateur non authentifié");
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null || user.getDeletedAt() != null) {
                return new ApiResponse(true, "Utilisateur introuvable ou supprimé");
            }

            return new ApiResponse(false, "Utilisateur trouvé avec succès", new UserDto().toUserDto(user));

        } catch (Exception ex) {
            ex.printStackTrace();
            return new ApiResponse(true, "Une erreur s'est produite");
        }
    }

    // Update user
    public ApiResponse updateUser(Long userId, UpdateUserRequest request) {
        try {
            User user = userRepository.findById(Math.toIntExact(userId)).orElse(null);

            if (user == null || user.getDeletedAt() != null) { // check soft delete
                return new ApiResponse(true, "Utilisateur introuvable ou supprimé");
            }

            // Get the ID of the user performing the update from SecurityContext
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer updatedByUserId = null;
            if (auth != null && auth.isAuthenticated()) {
                try {
                    updatedByUserId = Integer.parseInt(auth.getName()); // auth.getName() should be userId
                } catch (NumberFormatException ignored) {
                }
            }

            // Update fields
            if (request.getNom() != null) user.setNom(request.getNom());
            if (request.getPrenom() != null) user.setPrenom(request.getPrenom());
            if (request.getEmail() != null) user.setEmail(request.getEmail());
            if (request.getMotDePasse() != null) user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
            if (request.getTelephone() != null) user.setTelephone(request.getTelephone());
            if (request.getAdresse() != null) user.setAdresse(request.getAdresse());
            if (request.getSexe() != null) user.setSexe(SexeEnum.valueOf(request.getSexe()));
            if (request.getDateNaissance() != null) user.setDateNaissance(request.getDateNaissance());
            if (request.getStatut() != null) user.setStatut(request.getStatut());
            if (request.getRole() != null) user.setRole(com.shifatech.authservice.Enum.RoleEnum.valueOf(request.getRole()));

            // Set audit fields
            user.setUpdatedAt(LocalDateTime.now());
            user.setUpdatedBy(updatedByUserId);

            userRepository.save(user);

            return new ApiResponse(false, "Utilisateur mis à jour avec succès", new UserDto().toUserDto(user));

        } catch (Exception ex) {
            System.out.println("Something went wrong" + ex);
            return new ApiResponse(true, "Une erreur s'est produite lors de la mise à jour");
        }
    }

    // Delete user
    public ApiResponse deleteUser(Integer userId, Integer deletedByUserId) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

            if (user.getDeletedAt() != null) {
                return new ApiResponse(true, "L'utilisateur est déjà supprimé");
            }

            user.setDeletedAt(LocalDateTime.now());
            user.setDeletedBy(deletedByUserId);

            userRepository.save(user);

            return new ApiResponse(false, "Utilisateur supprimé avec succès");

        } catch (Exception ex) {
            return new ApiResponse(true, "Une erreur s'est produite lors de la suppression de l'utilisateur");
        }
    }

    // Logout user
    public ApiResponse logout(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Integer userId = jwtUtil.extractClaims(token).get("userId", Integer.class);
                User user = userRepository.findById(userId).orElse(null);

                if (user == null || user.getDeletedAt() != null) {
                    return new ApiResponse(true, "Utilisateur introuvable ou supprimé");
                }

                revokedTokenRepository.save(RevokedToken.builder().token(token).revokedAt(Instant.now()).build());
            }
            return new ApiResponse(false, "Déconnecté avec succès");
        } catch (Exception ex) {
            return new ApiResponse(true, "Une erreur s'est produite lors de la déconnexion");
        }
    }
    // Get user by ID
    public ApiResponse getUserById(Integer userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || user.getDeletedAt() != null) {
                return new ApiResponse(true, "Utilisateur introuvable ou supprimé");
            }
            return new ApiResponse(false, "Utilisateur trouvé avec succès", new UserDto().toUserDto(user));
        } catch (Exception ex) {
            return new ApiResponse(true, "Une erreur s'est produite lors de la récupération de l'utilisateur");
        }
    }


}