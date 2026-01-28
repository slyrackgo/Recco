package com.example.recco.Service;

import com.example.recco.Component.InterestTypeMapper;
import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.InterestType;
import com.example.recco.Model.User;
import com.example.recco.Model.UserInterest;
import com.example.recco.Repository.UserInterestRepository;
import com.example.recco.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));

        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), new ArrayList<>());
    }

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public List<User> getUsers() { return userRepository.findAll(); }
    public User getUserById(UUID id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<UserInterest> getUserInterestsById(UUID userId) {
        return userInterestRepository.findByUserId(userId);
    }
    public User getUserByName(String name) { return userRepository.findByName(name).orElse(null); }

    public List<InterestTypeDto> getUserDashboard(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        return user.getDashboardInterests()
                .stream()
                .map(interestTypeMapper::toDto)
                .toList();


    }

    public List<InterestTypeDto> addInterestType(InterestTypeDto interestTypeDto) {
        // Get current authenticated user from security context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
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



}