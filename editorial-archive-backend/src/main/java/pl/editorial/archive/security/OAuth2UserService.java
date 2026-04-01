package pl.editorial.archive.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.editorial.archive.domain.user.User;
import pl.editorial.archive.domain.user.UserRepository;
import pl.editorial.archive.domain.user.UserRole;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oauth2User.getAttributes();

        String email;
        String name;
        String providerId;
        String avatarUrl;
        String provider;

        if ("google".equals(registrationId)) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            providerId = (String) attributes.get("sub");
            avatarUrl = (String) attributes.get("picture");
            provider = "GOOGLE";
        } else if ("facebook".equals(registrationId)) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            providerId = (String) attributes.get("id");
            @SuppressWarnings("unchecked")
            Map<String, Object> picture = (Map<String, Object>) attributes.get("picture");
            if (picture != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) picture.get("data");
                avatarUrl = data != null ? (String) data.get("url") : null;
            } else {
                avatarUrl = null;
            }
            provider = "FACEBOOK";
        } else {
            throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        }

        User user = userRepository.findByProviderAndProviderId(provider, providerId)
            .orElseGet(() -> userRepository.findByEmail(email).orElse(null));

        if (user == null) {
            user = User.builder()
                .email(email)
                .displayName(name != null ? name : email)
                .avatarUrl(avatarUrl)
                .provider(provider)
                .providerId(providerId)
                .role(UserRole.CREATOR)
                .build();
        } else {
            user.setAvatarUrl(avatarUrl);
            if (user.getDisplayName() == null || user.getDisplayName().isBlank()) {
                user.setDisplayName(name != null ? name : email);
            }
            if (user.getProviderId() == null) {
                user.setProvider(provider);
                user.setProviderId(providerId);
            }
        }

        user = userRepository.save(user);

        Map<String, Object> mergedAttributes = new HashMap<>(attributes);
        mergedAttributes.put("userId", user.getId().toString());

        String userNameAttributeKey = userRequest.getClientRegistration()
            .getProviderDetails()
            .getUserInfoEndpoint()
            .getUserNameAttributeName();

        return new DefaultOAuth2User(
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
            mergedAttributes,
            userNameAttributeKey
        );
    }
}
