package pl.editorial.archive.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.editorial.archive.security.RefreshTokenRepository;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class CleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(cron = "0 0 3 * * *") // Schedule to run daily at 3 AM
    @Transactional
    public void cleanupExpiredRefreshTokens() {
        long deleted = 0;
        try {
            refreshTokenRepository.deleteExpiredTokens(Instant.now());
            log.info("Cleanup: usunięto wygasłe refresh tokeny");
        } catch (Exception ex) {
            log.error("Błąd podczas czyszczenia wygasłych tokenów", ex);
        }
    }
}
