package pl.editorial.archive.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * Abstrakcja nad S3/MinIO.
 * Implementacja: {@link S3StorageService}.
 */
public interface StorageService {

    /** Zapisuje plik i zwraca klucz (storage key). */
    String store(MultipartFile file, String keyPrefix);

    /** Generuje presigned URL ważny przez podaną liczbę sekund. */
    String presignedUrl(String storageKey, int expirySeconds);

    /** Usuwa obiekt ze storage. */
    void delete(String storageKey);

    /** Zwraca strumień obiektu (do przetwarzania miniatur). */
    InputStream download(String storageKey);
}
