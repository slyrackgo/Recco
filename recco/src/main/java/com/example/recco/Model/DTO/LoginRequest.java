package com.example.recco.Model.DTO;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}