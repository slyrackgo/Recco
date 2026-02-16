package com.example.recco.Controller;

import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.User;
import com.example.recco.Model.UserInterest;
import com.example.recco.Model.InterestType;
import com.example.recco.Service.UserService;
import jdk.jfr.Description;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UserController {
    public static record DescriptionDto(String description) {}
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /api/user
    @PostMapping("/user")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // GET /api/users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getUsers();
    }

    // GET /api/users/id/{id}
    @GetMapping("/users/id/{id}")
    public User getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    // GET /api/users/name/{name}
    @GetMapping("/users/name/{name}")
    public User getUserByName(@PathVariable String name) {
        return userService.getUserByName(name);
    }

    // GET /api/users/{id}/dashboard
    @GetMapping("/users/{id}/dashboard")
    public List<InterestTypeDto> getUserDashboard(@PathVariable UUID id) {
        return userService.getDashboard(id);
    }


    // POST /api/users/interests
    @PostMapping("/users/interests")
    public List<InterestTypeDto> addInterestType(@RequestBody InterestTypeDto interestTypeDto) {
        return userService.addInterestType(interestTypeDto);
    }

    // GET /api/users/interests/{id}
    @GetMapping("/users/interests/{id}")
    public List<UserInterest> getUserInterestsById(@PathVariable UUID id) {
        return userService.getUserInterestsById(id);
    }

    // GET /api/interests/{code}/posts  -> returns UserInterest rows for the given interest type (all users)
    @GetMapping("/interests/{code}/posts")
    public List<UserInterest> getInterestsByCode(@PathVariable String code) {
        try {
            InterestType type = InterestType.valueOf(code);
            return userService.getUserInterestsByType(type);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }


    // UPDATE /
    @PutMapping("/users/interests/{interestId}/description")
    public ResponseEntity<UserInterest> updateUserInterestDescription(
            @PathVariable Long interestId,
            @RequestBody DescriptionDto body) {

        var updated = userService.updateUserInterestDescription(interestId, body.description());
        return updated.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }



}
