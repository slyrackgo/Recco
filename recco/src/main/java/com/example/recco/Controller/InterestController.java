package com.example.recco.Controller;

import com.example.recco.Component.InterestTypeMapper;
import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Model.InterestType;
import com.example.recco.Model.UserInterest;
import com.example.recco.Service.InterestService;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class InterestController {

    private final InterestTypeMapper interestTypeMapper;
    private final InterestService interestService;


    public InterestController(InterestTypeMapper interestTypeMapper, InterestService interestService) {
        this.interestTypeMapper = interestTypeMapper;
        this.interestService = interestService;
    }

    // GET /api/interests
    @GetMapping("/interests")
    public List<InterestTypeDto> getAvailableInterests() {
        return Arrays.stream(InterestType.values())
                .map(interestTypeMapper::toDto)
                .toList();
    }



}
