package com.example.recco.Model;


import com.example.recco.Model.DTO.InterestType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private String surname;

    @Column(nullable = false, unique = true)
    private String email;


    private String password;

    //InterestType model
   @ElementCollection(targetClass = InterestType.class)
   @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
   @Enumerated(EnumType.STRING) // Stores "BOOKS" instead of 0 in the DB
   private Set<InterestType> interests;
}
