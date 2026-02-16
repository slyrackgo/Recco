package com.example.recco.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "user_interests")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class UserInterest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterestType interestType;

    private String title;
    private String description;
    private String rating;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt; // Instant stores time in UTC

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

}
