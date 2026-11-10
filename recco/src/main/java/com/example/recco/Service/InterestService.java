package com.example.recco.Service;

import com.example.recco.Component.InterestTypeMapper;
import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.InterestType;
import com.example.recco.Model.UserInterest;
import com.example.recco.Repository.UserInterestRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class InterestService {

    private final InterestTypeMapper mapper;
    private final UserInterestRepository userInterestRepository;
    public InterestService(InterestTypeMapper mapper, UserInterestRepository userInterestRepository) {
        this.mapper = mapper;
        this.userInterestRepository = userInterestRepository;
    }

    public List<InterestTypeDto> getAllAvailable() {
        return Arrays.stream(InterestType.values())
                .map(mapper::toDto)
                .toList();
    }



}
