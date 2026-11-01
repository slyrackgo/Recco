package com.example.recco.Service;

import com.example.recco.Component.InterestTypeMapper;
import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.DTO.UserInterestSummaryDto;
import com.example.recco.Model.InterestType;
import com.example.recco.Model.User;
import com.example.recco.Model.UserInterest;
import com.example.recco.Repository.UserInterestRepository;
import com.example.recco.Repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Service
public class UserService implements UserDetailsService {

    private final InterestTypeMapper interestTypeMapper;
    private final UserRepository userRepository;
    private final UserInterestRepository userInterestRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            InterestTypeMapper interestTypeMapper,
            UserRepository userRepository,
            UserInterestRepository userInterestRepository,
            PasswordEncoder passwordEncoder) {
        this.interestTypeMapper = interestTypeMapper;
        this.userRepository = userRepository;
        this.userInterestRepository = userInterestRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), Collections.emptyList());
    }

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public List<User> searchUsers(String query) {
        String term = query.trim();
        return userRepository
                .findTop20ByNameContainingIgnoreCaseOrSurnameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        term, term, term);
    }

    public List<User> getUsers() { return userRepository.findAll(); }
    public User getUserById(UUID id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<UserInterest> getUserInterestsById(UUID userId) {
        return userInterestRepository.findByUserId(userId);
    }

    public List<UserInterestSummaryDto> getUserInterestSummary(UUID userId) {
        return userInterestRepository.summarizeByUserId(userId);
    }

    public List<UserInterest> getUserInterestsByType(InterestType interestType) {
        return userInterestRepository.findByInterestType(interestType);
    }

    public List<UserInterest> getUserInterestsByTypeAndUser(InterestType interestType, UUID userId) {
        return userInterestRepository.findByInterestTypeAndUserId(interestType, userId);
    }

    public User getUserByName(String name) { return userRepository.findByName(name).orElse(null); }


    public List<InterestTypeDto> getDashboard(UUID userId) {

        List<InterestTypeDto> result = new ArrayList<>();

        for (InterestType type : InterestType.values()) {
            result.add(new InterestTypeDto(
                    type.name(),
                    null,
                    interestTypeMapper.icon(type),
                    null
            ));
        }

        return result;
    }


    public List<InterestTypeDto> addInterestType(InterestTypeDto interestTypeDto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (interestTypeDto == null || interestTypeDto.code() == null || interestTypeDto.code().isEmpty()) {
            throw new RuntimeException("Interest type code is required and cannot be null or empty");
        }

        InterestType interestType;
        try {
            interestType = InterestType.valueOf(interestTypeDto.code());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid interest type: " + interestTypeDto.code() + ". Valid values are: BOOKS, TV_SHOWS, PODCASTS, GAMES");
        }

        UserInterest userInterest = new UserInterest();
        userInterest.setUser(user);
        userInterest.setInterestType(interestType);
        userInterest.setTitle(interestTypeDto.label());
        userInterest.setDescription(interestTypeDto.description());

        userInterestRepository.save(userInterest);

        return userInterestRepository.findDistinctTypesByUserId(user.getId()).stream()
                .map(interestTypeMapper::toDto)
                .toList();


    }




    public Optional<UserInterest> updateUserInterest(
            Long interestId,
            String title,
            String description,
            LocalDate date) {

        return userInterestRepository.findById(interestId)
                .map(ui -> {
                    String email = SecurityContextHolder.getContext().getAuthentication().getName();
                    User current = userRepository.findByEmail(email).orElse(null);
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
        User current = userRepository.findByEmail(email).orElse(null);
        if (current == null || !ui.getUser().getId().equals(current.getId())) return false;

        userInterestRepository.delete(ui);
        return true;

    }

}