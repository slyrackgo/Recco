package com.example.recco.Model.DTO;

import com.example.recco.Model.User;
import java.util.UUID;

public record JwtResponse(String token, UserDto user) {
    public static JwtResponse from(String token, User user) {
        return new JwtResponse(token, new UserDto(user.getId(), user.getEmail(), user.getName(), user.getSurname()));
    }

    public record UserDto(UUID id, String email, String name, String surname) {}
}
