package com.example.recco.Model.DTO;

import com.example.recco.Model.InterestType;
import java.time.Instant;

public record UserInterestSummaryDto(InterestType interestType, Long count, Instant latestCreatedAt) {}
