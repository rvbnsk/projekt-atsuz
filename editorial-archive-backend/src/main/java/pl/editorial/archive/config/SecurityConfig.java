package pl.editorial.archive.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import pl.editorial.archive.security.JwtAuthenticationFilter;
import pl.editorial.archive.security.OAuth2SuccessHandler;
import pl.editorial.archive.security.OAuth2UserService;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2UserService oAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                // Specific protected paths BEFORE any photo wildcard
                .requestMatchers(HttpMethod.GET, "/api/v1/photos/my").hasAnyRole("CREATOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/photos/my/*").hasAnyRole("CREATOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/photos/pending").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,
                    "/api/v1/photos",
                    "/api/v1/photos/search",
                    "/api/v1/photos/*",
                    "/api/v1/photos/*/*",
                    "/api/v1/hierarchy/**",
                    "/api/v1/tags"
                ).permitAll()
                .requestMatchers(HttpMethod.POST,
                    "/api/v1/photos/*/view"
                ).permitAll()
                .requestMatchers(
                    "/api/v1/auth/login",
                    "/api/v1/auth/register",
                    "/api/v1/auth/refresh",
                    "/api/v1/auth/logout",
                    "/oauth2/**",
                    "/login/oauth2/**"
                ).permitAll()
                // Swagger UI
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html"
                ).permitAll()
                // Actuator health
                .requestMatchers("/actuator/health").permitAll()
                // Dev stub storage (only active when app.storage.use-stub=true)
                .requestMatchers("/api/dev/files/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/photos").hasAnyRole("CREATOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/photos/*").hasAnyRole("CREATOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/photos/*").hasAnyRole("CREATOR", "ADMIN")
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/photos/*/status").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oAuth2UserService))
                .successHandler(oAuth2SuccessHandler));

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration authConfig
    ) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
