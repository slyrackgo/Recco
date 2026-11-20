package com.example.recco.Service;

import com.example.recco.Component.InterestTypeMapper;
import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.InterestType;
import com.example.recco.Model.User;
import com.example.recco.Model.UserInterest;
import com.example.recco.Repository.UserInterestRepository;
import com.example.recco.Repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private final InterestTypeMapper interestTypeMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private UserInterestRepository userInterestRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public UserService(InterestTypeMapper interestTypeMapper) {
        this.interestTypeMapper = interestTypeMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), new ArrayList<>());
    }

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public boolean verifyPassword(User user, String rawPassword) {
        String storedPassword = user.getPassword();
        if (rawPassword == null || storedPassword == null) {
            return false;
        }

        if (passwordEncoder.matches(rawPassword, storedPassword)) {
            return true;
        }

        if (storedPassword.startsWith("$2")) {
            return false;
        }

        if (storedPassword.equals(rawPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }

        return false;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email).orElse(null);
    }

    public List<User> searchUsers(String query) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.isEmpty()) {
            return List.of();
        }
        return userRepository.searchByQuery(normalizedQuery, PageRequest.of(0, 20));
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<UserInterest> getUserInterestsById(UUID userId) {
        return userInterestRepository.findByUserId(userId);
    }

    /**
     * Return all UserInterest rows for a given InterestType (across all users).
     */
    public List<UserInterest> getUserInterestsByType(InterestType interestType) {
        return userInterestRepository.findByInterestType(interestType);
    }

    /**
     * Return only the specified user's interests for a given type.
     */
    public List<UserInterest> getUserInterestsByTypeAndUser(InterestType interestType, UUID userId) {
        return userInterestRepository.findByInterestTypeAndUserId(interestType, userId);
    }

    //get dashboard values
    public List<InterestTypeDto> getDashboard(UUID userId) {
        List<InterestTypeDto> result = new ArrayList<>();

        for (InterestType type : InterestType.values()) {
            // Always return the global interest type without user-specific data
            // This prevents user's personal interest data from leaking to other users
            result.add(new InterestTypeDto(
                    type.name(),
                    null,  // Don't include user's title
                    interestTypeMapper.icon(type),
                    null   // Don't include user's description
            ));
        }

        return result;
    }

    public List<InterestTypeDto> addInterestType(InterestTypeDto interestTypeDto) {
        // Get current authenticated user from security context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Validate DTO code is not null
        if (interestTypeDto == null || interestTypeDto.code() == null || interestTypeDto.code().isEmpty()) {
            throw new RuntimeException("Interest type code is required and cannot be null or empty");
        }

        // Parse InterestType from DTO code
        InterestType interestType;
        try {
            interestType = InterestType.valueOf(interestTypeDto.code());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid interest type: " + interestTypeDto.code() + ". Valid values are: BOOKS, TV_SHOWS, PODCASTS, GAMES");
        }

        // Create and save UserInterest
        UserInterest userInterest = new UserInterest();
        userInterest.setUser(user);
        userInterest.setInterestType(interestType);
        userInterest.setTitle(interestTypeDto.label());
        userInterest.setDescription(interestTypeDto.description());

        userInterestRepository.save(userInterest);

        // Return all unique interest types from user's interests
        List<UserInterest> userInterests = userInterestRepository.findByUserId(user.getId());
        Set<InterestType> uniqueInterestTypes = userInterests.stream()
                .map(UserInterest::getInterestType)
                .collect(Collectors.toSet());

        return uniqueInterestTypes.stream()
                .map(interestTypeMapper::toDto)
                .toList();


    }




    //update service
    public Optional<UserInterest> updateUserInterest(
            Long interestId,
            String title,
            String description,
            LocalDate date) {

        return userInterestRepository.findById(interestId)
                .map(ui -> {
                    String email = SecurityContextHolder.getContext().getAuthentication().getName();
                    User current = userRepository.findByEmailIgnoreCase(email).orElse(null);
                    if (current == null || !ui.getUser().getId().equals(current.getId())) {
                        return null;
                    }
                    ui.setTitle(title);
                    ui.setDescription(description);
                    if (date != null) {
                        ui.setCreatedAt(date.atStartOfDay(ZoneOffset.UTC).toInstant());
                    }
                    return userInterestRepository.save(ui);
                });
    }

    public boolean deleteInterest(Long interestId){
        var opt = userInterestRepository.findById(interestId);
        if (opt.isEmpty()) return false;
        UserInterest ui = opt.get();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User current = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (current == null || !ui.getUser().getId().equals(current.getId())) return false;

        userInterestRepository.delete(ui);
        return true;

    }

}