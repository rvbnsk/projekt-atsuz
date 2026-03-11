package pl.editorial.archive.domain.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.editorial.archive.api.dto.AuthDtos;
import pl.editorial.archive.api.exception.ResourceNotFoundException;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Rejestracja, logowanie i zarządzanie tokenami")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Rejestracja nowego użytkownika (lokalnie)")
    public ResponseEntity<AuthDtos.AuthResponse> register(
        @Valid @RequestBody AuthDtos.RegisterRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Logowanie lokalne — zwraca JWT + refresh token")
    public ResponseEntity<AuthDtos.AuthResponse> login(
        @Valid @RequestBody AuthDtos.LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Odświeżenie access tokena przy użyciu refresh tokena")
    public ResponseEntity<AuthDtos.TokenResponse> refresh(
        @Valid @RequestBody AuthDtos.RefreshRequest request
    ) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Wylogowanie — unieważnia refresh token")
    public ResponseEntity<Void> logout(
        @Valid @RequestBody AuthDtos.RefreshRequest request
    ) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout/all")
    @Operation(summary = "Wylogowanie ze wszystkich urządzeń")
    public ResponseEntity<Void> logoutAll(
        @AuthenticationPrincipal UUID userId
    ) {
        authService.logoutAll(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Dane zalogowanego użytkownika")
    public ResponseEntity<AuthDtos.UserDto> me(
        @AuthenticationPrincipal UUID userId
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        return ResponseEntity.ok(new AuthDtos.UserDto(
            user.getId().toString(),
            user.getEmail(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getRole().name()
        ));
    }
}
