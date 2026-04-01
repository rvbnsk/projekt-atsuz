package pl.editorial.archive.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import pl.editorial.archive.api.dto.AuthDtos;
import pl.editorial.archive.domain.user.AuthService;
import pl.editorial.archive.domain.user.User;
import pl.editorial.archive.domain.user.UserRepository;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String userId = (String) oauth2User.getAttributes().get("userId");

        User user = userRepository.findById(UUID.fromString(userId))
            .orElseThrow(() -> new IllegalStateException("User not found after OAuth2 login"));

        AuthDtos.AuthResponse authResponse = authService.issueTokensForUser(user);

        String redirectUrl = UriComponentsBuilder
            .fromUriString(frontendUrl + "/auth/callback")
            .queryParam("token", authResponse.accessToken())
            .queryParam("refresh", authResponse.refreshToken())
            .build()
            .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
