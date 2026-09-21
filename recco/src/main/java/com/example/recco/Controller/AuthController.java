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

    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Check if email already exists
        String email = user.getEmail() == null ? null : user.getEmail().trim().toLowerCase();
        user.setEmail(email);

        if (userService.getUserByEmail(email) != null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use"));
        }
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail() == null ? null : loginRequest.getEmail().trim().toLowerCase();
        String provided = "[PROVIDED]";
        org.slf4j.LoggerFactory.getLogger(AuthController.class).info("Login attempt for email={}", email);

        User user = userService.getUserByEmail(email);
        if (user == null) {
            org.slf4j.LoggerFactory.getLogger(AuthController.class).warn("Login failed: user not found for email={}", email);
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        boolean matches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        org.slf4j.LoggerFactory.getLogger(AuthController.class).info("Password match for {}: {}", email, matches);

        if (matches) {
            String token = jwtUtils.generateToken(user.getEmail());
            return ResponseEntity.ok(new JwtResponse(token));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
    }
}