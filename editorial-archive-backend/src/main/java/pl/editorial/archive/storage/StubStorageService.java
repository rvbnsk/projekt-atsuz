package pl.editorial.archive.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.UUID;

/**
 * No-op storage używany gdy S3 nie jest skonfigurowane.
 * Aktywowany przez: app.storage.use-stub=true (domyślnie dev)
 */
@Service
@ConditionalOnProperty(name = "app.storage.use-stub", havingValue = "true", matchIfMissing = true)
@Slf4j
public class StubStorageService implements StorageService {

    @Override
    public String store(MultipartFile file, String keyPrefix) {
        String key = keyPrefix + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        log.info("[StubStorage] store: key={}, size={}B", key, file.getSize());
        return key;
    }

    @Override
    public void storeBytes(byte[] data, String key, String contentType) {
        log.info("[StubStorage] storeBytes: key={}, size={}B", key, data.length);
    }

    @Override
    public String presignedUrl(String storageKey, int expirySeconds) {
        // In stub mode, files are not actually stored — return null so
        // the frontend falls back to the placeholder image.
        return null;
    }

    @Override
    public void delete(String storageKey) {
        log.info("[StubStorage] delete: key={}", storageKey);
    }

    @Override
    public InputStream download(String storageKey) {
        return new ByteArrayInputStream(new byte[0]);
    }
}
