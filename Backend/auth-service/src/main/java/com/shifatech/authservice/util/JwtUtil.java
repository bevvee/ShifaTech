package com.shifatech.authservice.util;

import com.shifatech.authservice.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

@Component
public class JwtUtil {

    private final SecretKey SECRET_KEY;
    private final long accessMillis;

    public JwtUtil(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.accessMillis}") long accessMillis) {
        this.SECRET_KEY = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.accessMillis = accessMillis;
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("userId", user.getIdUser())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessMillis)) // use configured duration
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
