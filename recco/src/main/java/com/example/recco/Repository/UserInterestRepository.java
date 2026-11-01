package com.example.recco.Repository;

import com.example.recco.Model.InterestType;
import com.example.recco.Model.UserInterest;
import com.example.recco.Model.DTO.UserInterestSummaryDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {
    @EntityGraph(attributePaths = "user")
    List<UserInterest> findByUserId(UUID userId);

    @EntityGraph(attributePaths = "user")
    List<UserInterest> findByInterestType(InterestType interestType);

    @EntityGraph(attributePaths = "user")
    List<UserInterest> findByInterestTypeAndUserId(InterestType interestType, UUID userId);

    @Query("""
            select new com.example.recco.Model.DTO.UserInterestSummaryDto(
                interest.interestType, count(interest), max(interest.createdAt))
            from UserInterest interest
            where interest.user.id = :userId
            group by interest.interestType
            """)
    List<UserInterestSummaryDto> summarizeByUserId(@Param("userId") UUID userId);

    @Query("select distinct interest.interestType from UserInterest interest where interest.user.id = :userId")
    List<InterestType> findDistinctTypesByUserId(@Param("userId") UUID userId);

}
