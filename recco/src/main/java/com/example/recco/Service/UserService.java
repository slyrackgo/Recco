package com.example.recco.Service;

import com.example.recco.Repository.UserRepository;
import com.example.recco.Model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UserService {
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;

    public UserService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }


    public User registerUser(User user){
        // The password is received in plain text in the POST request body (over HTTPS)
        String plainPassword = user.getPassword();

        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(plainPassword);
        user.setPassword(hashedPassword);

        // Save the user with the hashed password to the database
        userRepository.save(user);
        return user;
    }

    public List<User> getUsers(){
        return userRepository.findAll();
    }

    public User getUserById(java.util.UUID id){
        return userRepository.findById(id).orElse(null);
    }

    public User getUserByName(String name){
        return userRepository.findByName(name).orElse(null);
    }



}
