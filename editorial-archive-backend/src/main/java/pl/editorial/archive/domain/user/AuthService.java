package pl.editorial.archive.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.editorial.archive.api.dto.AuthDtos;
import pl.editorial.archive.api.exception.BusinessException;
import pl.editorial.archive.security.JwtTokenProvider;
import pl.editorial.archive.security.RefreshToken;
import pl.editorial.archive.security.RefreshTokenRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.jwt.refresh-expiration-days}")
    private int refreshExpirationDays;

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("EMAIL_TAKEN", "Podany email jest już zajęty");
        }

        User user = User.builder()
            .email(request.email())
            .displayName(request.displayName())
            .passwordHash(passwordEncoder.encode(request.password()))
            .role(UserRole.CREATOR)
            .provider("LOCAL")
            .build();

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new BadCredentialsException("Nieprawidłowy email lub hasło"));

        if (user.isBlocked()) {
            throw new BusinessException("USER_BLOCKED", "Konto zostało zablokowane");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Nieprawidłowy email lub hasło");
        }

        return buildAuthResponse(user);
    }

    public AuthDtos.TokenResponse refresh(String rawRefreshToken) {
        String tokenHash = hashToken(rawRefreshToken);

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new BusinessException("INVALID_REFRESH_TOKEN", "Nieprawidłowy refresh token"));

        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new BusinessException("REFRESH_TOKEN_EXPIRED", "Refresh token wygasł");
        }

        User user = storedToken.getUser();
        if (user.isBlocked()) {
            refreshTokenRepository.delete(storedToken);
            throw new BusinessException("USER_BLOCKED", "Konto zostało zablokowane");
        }

        // Rotacja refresh tokena
        refreshTokenRepository.delete(storedToken);
        String newRawRefreshToken = generateRawRefreshToken();
        saveRefreshToken(user, newRawRefreshToken);

        String accessToken = jwtTokenProvider.generateToken(
            user.getId(), user.getEmail(), user.getRole().name()
        );

        return new AuthDtos.TokenResponse(accessToken, newRawRefreshToken);
    }

    public void logout(String rawRefreshToken) {
        String tokenHash = hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash)
            .ifPresent(refreshTokenRepository::delete);
    }

    public void logoutAll(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    /** Used by OAuth2SuccessHandler to issue tokens for an already-authenticated user. */
    public AuthDtos.AuthResponse issueTokensForUser(User user) {
        return buildAuthResponse(user);
    }

    private AuthDtos.AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateToken(
            user.getId(), user.getEmail(), user.getRole().name()
        );
        String rawRefreshToken = generateRawRefreshToken();
        saveRefreshToken(user, rawRefreshToken);

        AuthDtos.UserDto userDto = new AuthDtos.UserDto(
            user.getId().toString(),
            user.getEmail(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getRole().name()
        );

        return new AuthDtos.AuthResponse(accessToken, rawRefreshToken, userDto);
    }

    private void saveRefreshToken(User user, String rawToken) {
        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .tokenHash(hashToken(rawToken))
            .expiresAt(Instant.now().plus(refreshExpirationDays, ChronoUnit.DAYS))
            .build();
        refreshTokenRepository.save(refreshToken);
    }

    private String generateRawRefreshToken() {
        return UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
    }

    private String hashToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
