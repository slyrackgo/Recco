package com.example.recco.Auth;

import com.example.recco.Auth.JwtUtils;
import com.example.recco.Service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserService userService;

    // We use @Lazy here to break the circular dependency:
    // SecurityConfig -> JwtFilter -> UserService -> PasswordEncoder -> SecurityConfig
    @Autowired
    public JwtFilter(JwtUtils jwtUtils, @Lazy UserService userService) {
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtUtils.validateJwtToken(token)) {
                String email = jwtUtils.getUserNameFromJwtToken(token);

                // Load actual user details from DB to populate SecurityContext correctly
                UserDetails userDetails = userService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the user in the Security Context
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}