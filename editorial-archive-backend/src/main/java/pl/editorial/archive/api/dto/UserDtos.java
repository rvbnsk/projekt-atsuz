package pl.editorial.archive.api.dto;

import pl.editorial.archive.domain.user.UserRole;

import java.time.Instant;

public class UserDtos {

    public record UserResponse(
        String id,
        String email,
        String displayName,
        String avatarUrl,
        UserRole role,
        String provider,
        boolean isBlocked,
        Instant createdAt
    ) {}

    public record BlockRequest(boolean blocked) {}

    public record RoleChangeRequest(String role) {}
}
