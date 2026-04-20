package com.example.recco.Controller;

import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.User;
import com.example.recco.Model.UserInterest;
import com.example.recco.Model.InterestType;
import com.example.recco.Service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UserController {
    public record DescriptionDto(String description) {}
    private final UserService userService;
    //logger
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

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
        logger.info("Fetching user id with: {}", id);
        try{
            User user = userService.getUserById(id);
            if(user == null){
                logger.warn("User not found with ID: {}", id);
            } else{
                logger.debug("Successfully retrieved user: {}", user.getName());
            }
            return user;
        }
        catch (Exception e){
            logger.error("Error fetching user ID: {}", id, e);
            throw e;
        }

    }

    // GET /api/users/email/{email}
    @GetMapping("/users/email/{email}")
    public User getUserByEmail(@PathVariable String email) {
        logger.info("Fetching user email: {}", email);
        try {
            User user = userService.getUserByEmail(email);
            if (user == null) {
                logger.warn("User not found email {} not found: ", email);
            } else {
                logger.debug("Successfully retrieved user with email: {}", user.getEmail());
            }
            return user;
        }
        catch(Exception e){
            logger.error("Email not found: {}", email, e);
            throw e;
        }
    }

    // GET /api/users/name/{name}
    @GetMapping("/users/name/{name}")
    public User getUserByName(@PathVariable String name) {
        logger.info("Fetching uer name: {}", name);
        try{
            User user = userService.getUserByName(name);
            if(user == null){
                logger.warn("User with name not found: {}", name);
            } else{
                logger.debug("Successfully retrieved user with name: {}", user.getName());
            }
            return user;
        }
        catch (Exception e){
            logger.error("User name not found: {}", name, e);
            throw e;
        }
    }


    //TODO try catch
    // GET /api/users/{id}/dashboard
    @GetMapping("/users/{id}/dashboard")
    public List<InterestTypeDto> getUserDashboard(@PathVariable UUID id)     {
        return userService.getDashboard(id);
    }
    //TODO try catch
    // GET /api/users/dashboard/by-email
    @GetMapping("/users/dashboard/by-email")
    public List<InterestTypeDto> getUserDashboardByEmail(@RequestParam String email) {
        User user = userService.getUserByEmail(email);
        if (user == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "User not found with email: " + email
            );
        }
        return userService.getDashboard(user.getId());
    }

    //TODO try catch
    // POST /api/users/interests
    @PostMapping("/users/interests")
    public List<InterestTypeDto> addInterestType(@RequestBody InterestTypeDto interestTypeDto) {
        return userService.addInterestType(interestTypeDto);
    }

    //TODO try catch
    // GET /api/users/interests/{id}
    @GetMapping("/users/interests/{id}")
    public List<UserInterest> getUserInterestsById(@PathVariable UUID id) {
        return userService.getUserInterestsById(id);
    }
    //TODO try catch
    // GET /api/users/interests/by-email
    @GetMapping("/users/interests/by-email")
    public List<UserInterest> getUserInterestsByEmail(@RequestParam String email) {
        User user = userService.getUserByEmail(email);
        if (user == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "User not found with email: " + email
            );
        }
        return userService.getUserInterestsById(user.getId());
    }

    //TODO try catch
    // GET /api/interests/{code}/posts?userId={userId}
    // If userId provided: returns only that user's posts for the interest
    // If userId not provided: returns all posts for the interest
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

    //TODO try catch
    // UPDATE /api/users/interests/{interestId}/description
    @PutMapping("/users/interests/{interestId}/description")
    public ResponseEntity<UserInterest> updateUserInterestDescription(
            @PathVariable Long interestId,
            @RequestBody DescriptionDto body) {

        var updated = userService.updateUserInterestDescription(interestId, body.description());
        return updated.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }


    //TODO try catch
    @DeleteMapping("/users/interests/{interestId}")
    public ResponseEntity<String> deleteUserInterest(@PathVariable Long interestId){
       boolean removed = userService.deleteInterest(interestId);
       return removed ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }


}
