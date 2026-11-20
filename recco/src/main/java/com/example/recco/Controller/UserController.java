package com.example.recco.Controller;

import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.User;
import com.example.recco.Model.UserInterest;
import com.example.recco.Model.InterestType;
import com.example.recco.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;
import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UserController {
    private static final int MAX_DESCRIPTION_LENGTH = 10_000;

    public record InterestUpdateDto(String title, String description, LocalDate date) {}
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // POST /api/user
    @PostMapping("/user")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @GetMapping("/users/me")
    public User getCurrentUser(Principal principal) {
        return userService.getUserByEmail(principal.getName());
    }

    @GetMapping("/users/search")
    public List<User> searchUsers(@RequestParam String q) {
        return userService.searchUsers(q);
    }

    // GET /api/users/id/{id}
    @GetMapping("/users/id/{id}")
    public User getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    // GET /api/users/{id}/dashboard
    @GetMapping("/users/{id}/dashboard")
    public List<InterestTypeDto> getUserDashboard(@PathVariable UUID id) {
        return userService.getDashboard(id);
    }


    // POST /api/users/interests
    @PostMapping("/users/interests")
    public ResponseEntity<List<InterestTypeDto>> addInterestType(@RequestBody InterestTypeDto interestTypeDto) {
        if (exceedsDescriptionLimit(interestTypeDto.description())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(userService.addInterestType(interestTypeDto));
    }

    // GET /api/users/interests/{id}
    @GetMapping("/users/interests/{id}")
    public List<UserInterest> getUserInterestsById(@PathVariable UUID id) {
        return userService.getUserInterestsById(id);
    }

    // GET /api/interests/{code}/posts?userId={userId}
    // If userId provided: returns only that user's posts for the interest
    // If userId not provided: returns all posts for this interest
    @GetMapping("/interests/{code}/posts")
    public List<UserInterest> getInterestsByCode(
            @PathVariable String code,
            @RequestParam(required = false) java.util.UUID userId) {
        try {
            InterestType type = InterestType.valueOf(code);
            if (userId != null) {
                // Return only this user's posts for this interest
                return userService.getUserInterestsByTypeAndUser(type, userId);
            } else {
                // Return all posts for this interest (fallback)
                return userService.getUserInterestsByType(type);
            }
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }


    // UPDATE /api/users/interests/{interestId}
    @PutMapping("/users/interests/{interestId}/description")
    public ResponseEntity<UserInterest> updateUserInterest(
            @PathVariable Long interestId,
            @RequestBody InterestUpdateDto body) {
        if (exceedsDescriptionLimit(body.description())) {
            return ResponseEntity.badRequest().build();
        }

        var updated = userService.updateUserInterest(
                interestId,
                body.title(),
                body.description(),
                body.date());
        return updated.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    private static boolean exceedsDescriptionLimit(String description) {
        return description != null && description.length() > MAX_DESCRIPTION_LENGTH;
    }



    @DeleteMapping("/users/interests/{interestId}")
    public ResponseEntity<String> deleteUserInterest(@PathVariable Long interestId){
       boolean removed = userService.deleteInterest(interestId);
       return removed ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }


}
