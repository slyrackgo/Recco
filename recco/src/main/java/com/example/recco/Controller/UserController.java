package com.example.recco.Controller;

import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.InterestType;
import com.example.recco.Model.User;
import com.example.recco.Service.UserService;

import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/user")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // /api/users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getUsers();
    }
    // /api/users/id/{id}
    @GetMapping("/users/id/{identifier}")
    public User getUser(@PathVariable String identifier) {
        // 1. Check if the string matches a UUID format
        if (identifier.matches("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")) {
            return userService.getUserById(UUID.fromString(identifier));
        }

        // 2. Otherwise, treat it as a Name
        return userService.getUserByName(identifier);
    }
    // /api/name/{name}
    @GetMapping("/users/name/{name}")
    public User getUserByName(@PathVariable String name) {
        return userService.getUserByName(name);
    }


    // /api/users/interests
//    @GetMapping("/api/users/interests")
//    public List<InterestTypeDto> getAvailableInterests() {
//        return Arrays.stream(InterestType.values())
//                .map(interestTypeMapper::toDto)
//                .toList();
//    }



}
