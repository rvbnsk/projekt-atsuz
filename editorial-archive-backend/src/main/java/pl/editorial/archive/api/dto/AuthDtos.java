package pl.editorial.archive.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(min = 2, max = 100) String displayName
    ) {}

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record RefreshRequest(
        @NotBlank String refreshToken
    ) {}

    public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserDto user
    ) {}

    public record UserDto(
        String id,
        String email,
        String displayName,
        String avatarUrl,
        String role
    ) {}

    public record TokenResponse(
        String accessToken,
        String refreshToken
    ) {}
}
