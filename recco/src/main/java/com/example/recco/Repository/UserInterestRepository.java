package com.example.recco.Repository;

import com.example.recco.Model.InterestType;
import com.example.recco.Model.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {
    List<UserInterest> findByUserId(UUID userId);
    List<UserInterest> findByInterestType(InterestType interestType);


}
