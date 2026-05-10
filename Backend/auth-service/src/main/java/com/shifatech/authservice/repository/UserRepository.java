package com.shifatech.authservice.repository;

import com.shifatech.authservice.entity.User;
import com.shifatech.authservice.Enum.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(RoleEnum role);
}