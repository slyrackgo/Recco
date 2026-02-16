package com.example.recco.Model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"interests", "dashboardInterests"})
public class User {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private String surname;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    private String password;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<UserInterest> interests = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<InterestType> dashboardInterests = new HashSet<>();


}
