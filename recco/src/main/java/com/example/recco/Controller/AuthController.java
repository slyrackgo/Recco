package com.example.recco.Controller;

import com.example.recco.Model.DTO.JwtResponse;
import com.example.recco.Model.DTO.LoginRequest;
import com.example.recco.Model.User;
import com.example.recco.Auth.JwtUtils;
import com.example.recco.Service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record RegisterRequest(String email, String password, String name, String surname) {}

    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        String email = request.email() == null ? null : request.email().trim().toLowerCase();
        if (email == null || email.isBlank() || request.password() == null || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        if (userService.getUserByEmail(email) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use"));
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(request.password());
        user.setName(request.name());
        user.setSurname(request.surname());
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail() == null ? null : loginRequest.getEmail().trim().toLowerCase();
        User user = userService.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        boolean matches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());

        if (matches) {
            String token = jwtUtils.generateToken(user.getEmail());
            return ResponseEntity.ok(JwtResponse.from(token, user));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
    }
}