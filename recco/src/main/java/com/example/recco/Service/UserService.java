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

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private final InterestTypeMapper interestTypeMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private UserInterestRepository userInterestRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private final InterestTypeMapper mapper;
    public UserService(InterestTypeMapper interestTypeMapper, InterestTypeMapper mapper) {
        this.interestTypeMapper = interestTypeMapper;
        this.mapper = mapper;
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

    public User getUserByName(String name) { return userRepository.findByName(name).orElse(null); }


    //get dashboard values
    public List<InterestTypeDto> getDashboard(UUID userId) {

        // 1. Load user interests from DB
        List<UserInterest> userInterests =
                userInterestRepository.findByUserId(userId);

        // 2. Map by InterestType
        Map<InterestType, UserInterest> userInterestMap =
                userInterestRepository.findByUserId(userId)
                        .stream()
                        .collect(Collectors.toMap(
                                UserInterest::getInterestType,
                                ui -> ui,
                                (oldValue, newValue) ->
                                        newValue.getCreatedAt().isAfter(oldValue.getCreatedAt())
                                                ? newValue
                                                : oldValue
                        ));


        // 3. Build dashboard response
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


//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
//
//        return user.getDashboardInterests()
//                .stream()
//                .map(interestTypeMapper::toDto)
//                .toList();




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




    //update service
    public  Optional<UserInterest> updateUserInterestDescription(Long interestId, String description) {

        return userInterestRepository.findById(interestId)
                .map(ui -> {
                    ui.setDescription(description);
                    return userInterestRepository.save(ui);
                });
    }

//    public User getUserByEmail(String email) {
//        return userRepository.findByEmail(email).orElse(null);
//    }

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