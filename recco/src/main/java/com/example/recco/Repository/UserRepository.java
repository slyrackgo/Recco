package com.example.recco.Repository;

import com.example.recco.Model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);

    @Query("""
            SELECT u FROM User u
            WHERE LOWER(CONCAT(COALESCE(u.name, ''), ' ', COALESCE(u.surname, ''))) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(COALESCE(u.name, '')) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(COALESCE(u.surname, '')) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY u.name, u.surname
            """)
    List<User> searchByQuery(@Param("query") String query, Pageable pageable);
}
