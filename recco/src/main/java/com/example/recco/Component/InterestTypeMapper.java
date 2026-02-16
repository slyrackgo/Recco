package com.example.recco.Component;

import com.example.recco.Model.InterestType;
import com.example.recco.Model.DTO.InterestTypeDto;
import org.springframework.stereotype.Component;

@Component
public class InterestTypeMapper {

    public InterestTypeDto toDto(InterestType type) {
        return new InterestTypeDto(
                type.name(),
                label(type),
                icon(type),
                description(type)
        );
    }

    private String label(InterestType type) {
        return switch (type) {
            case BOOKS -> "Books";
            case TV_SHOWS -> "TV Shows";
            case PODCASTS -> "Podcasts";
            case GAMES -> "Games";
        };
    }

    public String icon(InterestType type) {
        return switch (type) {
            case BOOKS -> "book";
            case TV_SHOWS -> "tv";
            case PODCASTS -> "mic";
            case GAMES -> "gamepad";
        };
    }

    private String description(InterestType type) {
        return switch (type) {
            case BOOKS -> "Books you are currently reading or want to read";
            case TV_SHOWS -> "TV shows and series you are watching";
            case PODCASTS -> "Podcasts you follow or recommend";
            case GAMES -> "Video games you are playing or completed";
        };
    }
}
