package pl.editorial.archive.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * No-op storage używany gdy S3 nie jest skonfigurowane.
 * Aktywowany przez: app.storage.use-stub=true (domyślnie dev)
 * Pliki trzymane w pamięci i serwowane przez DevStorageController.
 */
@Service
@ConditionalOnProperty(name = "app.storage.use-stub", havingValue = "true", matchIfMissing = true)
@Slf4j
public class StubStorageService implements StorageService {

    private final Map<String, byte[]> storage = new ConcurrentHashMap<>();
    private final Map<String, String> contentTypes = new ConcurrentHashMap<>();

    @Override
    public String store(MultipartFile file, String keyPrefix) {
        String key = keyPrefix + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        try {
            storeBytes(file.getBytes(), key, file.getContentType());
        } catch (IOException e) {
            log.warn("[StubStorage] Could not read file bytes: {}", e.getMessage());
        }
        return key;
    }

    @Override
    public void storeBytes(byte[] data, String key, String contentType) {
        storage.put(key, data);
        if (contentType != null) contentTypes.put(key, contentType);
        log.info("[StubStorage] storeBytes: key={}, size={}B", key, data.length);
    }

    @Override
    public String presignedUrl(String storageKey, int expirySeconds) {
        if (!storage.containsKey(storageKey)) return null;
        return "http://localhost:8080/api/dev/files/" + storageKey;
    }

    @Override
    public void delete(String storageKey) {
        storage.remove(storageKey);
        contentTypes.remove(storageKey);
        log.info("[StubStorage] delete: key={}", storageKey);
    }

    @Override
    public InputStream download(String storageKey) {
        byte[] data = storage.get(storageKey);
        return data != null ? new ByteArrayInputStream(data) : new ByteArrayInputStream(new byte[0]);
    }

    public byte[] getBytes(String key) {
        return storage.get(key);
    }

    public String getContentType(String key) {
        return contentTypes.getOrDefault(key, "application/octet-stream");
    }
}
