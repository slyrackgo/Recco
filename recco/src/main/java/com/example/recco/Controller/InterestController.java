package com.example.recco.Controller;

import com.example.recco.Model.DTO.InterestTypeDto;
import com.example.recco.Service.InterestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InterestController {

    private final InterestService interestService;

    public InterestController(InterestService interestService) {
        this.interestService = interestService;
    }

    // GET /api/interests
    @GetMapping("/interests")
    public List<InterestTypeDto> getAvailableInterests() {
        return interestService.getAllAvailable();
    }



}
