package com.example.recco.Controller;

import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.DTO.UserInterestSummaryDto;
import com.example.recco.Model.User;
import com.example.recco.Model.UserInterest;
import com.example.recco.Model.InterestType;
import com.example.recco.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api")
public class UserController {
    public record DescriptionDto(String description) {}
    public record InterestUpdateDto(String title, String description, LocalDate date) {}
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/user")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getUsers();
    }

    @GetMapping("/users/me")
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.getUserByEmail(email);
    }

    @GetMapping("/users/search")
    public List<User> searchUsers(@RequestParam String q) {
        if (q.isBlank()) {
            return List.of();
        }
        return userService.searchUsers(q);
    }

    @GetMapping("/users/id/{id}")
    public User getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    @GetMapping("/users/name/{name}")
    public User getUserByName(@PathVariable String name) {
        return userService.getUserByName(name);
    }

    @GetMapping("/users/{id}/dashboard")
    public List<InterestTypeDto> getUserDashboard(@PathVariable UUID id) {
        return userService.getDashboard(id);
    }


    @PostMapping("/users/interests")
    public List<InterestTypeDto> addInterestType(@RequestBody InterestTypeDto interestTypeDto) {
        return userService.addInterestType(interestTypeDto);
    }

    @GetMapping("/users/interests/{id}")
    public List<UserInterest> getUserInterestsById(@PathVariable UUID id) {
        return userService.getUserInterestsById(id);
    }

    @GetMapping("/users/interests/{id}/summary")
    public List<UserInterestSummaryDto> getUserInterestSummary(@PathVariable UUID id) {
        return userService.getUserInterestSummary(id);
    }

    @GetMapping("/interests/{code}/posts")
    public List<UserInterest> getInterestsByCode(
            @PathVariable String code,
            @RequestParam(required = false) java.util.UUID userId) {
        try {
            InterestType type = InterestType.valueOf(code);
            if (userId != null) {
                return userService.getUserInterestsByTypeAndUser(type, userId);
            } else {
                return userService.getUserInterestsByType(type);
            }
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }


    @PutMapping("/users/interests/{interestId}/description")
    public ResponseEntity<UserInterest> updateUserInterest(
            @PathVariable Long interestId,
            @RequestBody InterestUpdateDto body) {

        var updated = userService.updateUserInterest(
                interestId,
                body.title(),
                body.description(),
                body.date());
        return updated.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }



    @DeleteMapping("/users/interests/{interestId}")
    public ResponseEntity<String> deleteUserInterest(@PathVariable Long interestId){
       boolean removed = userService.deleteInterest(interestId);
       return removed ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }


}
