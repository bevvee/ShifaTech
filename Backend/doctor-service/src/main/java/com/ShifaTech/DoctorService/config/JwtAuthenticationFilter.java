package com.ShifaTech.DoctorService.config;

import com.ShifaTech.DoctorService.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // Debug Log
        log.debug("Checking Auth Header: {}", (header != null ? "PRESENT" : "MISSING"));

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtUtil.extractClaims(token);
                Object userIdObj = claims.get("userId");
                String userId = userIdObj != null ? userIdObj.toString() : null;
                Object rolesObject = claims.get("role");

                if (rolesObject == null) rolesObject = claims.get("roles");


                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    List<SimpleGrantedAuthority> authorities;

                    if (rolesObject instanceof List) {
                        authorities = ((List<?>) rolesObject).stream()
                                .map(r -> r.toString().startsWith("ROLE_") ? r.toString() : "ROLE_" + r.toString())
                                .map(SimpleGrantedAuthority::new)
                                .toList();
                    } else if (rolesObject != null) {
                        String role = rolesObject.toString();
                        if (!role.startsWith("ROLE_")) role = "ROLE_" + role;
                        authorities = Collections.singletonList(new SimpleGrantedAuthority(role));
                    } else {
                        authorities = Collections.emptyList();
                    }

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userId, null, authorities);

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }

            } catch (ExpiredJwtException e) {
                log.warn("Token EXPIRED: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":true,\"message\":\"Token expired\"}");
                return;
            } catch (JwtException e) {
                log.warn("Token INVALID: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":true,\"message\":\"Invalid token\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
