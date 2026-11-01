package com.example.recco.Service;

import com.example.recco.Component.InterestTypeMapper;
import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.InterestType;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class InterestService {

    private final InterestTypeMapper mapper;
    public InterestService(InterestTypeMapper mapper) {
        this.mapper = mapper;
    }

    public List<InterestTypeDto> getAllAvailable() {
        return Arrays.stream(InterestType.values())
                .map(mapper::toDto)
                .toList();
    }



}
