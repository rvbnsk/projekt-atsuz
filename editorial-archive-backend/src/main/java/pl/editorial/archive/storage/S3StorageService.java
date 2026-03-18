package pl.editorial.archive.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.use-stub", havingValue = "false")
@RequiredArgsConstructor
@Slf4j
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${app.storage.bucket}")
    private String bucket;

    @Override
    public String store(MultipartFile file, String keyPrefix) {
        String key = keyPrefix + "/" + UUID.randomUUID() + "-" + sanitizeFilename(file.getOriginalFilename());
        ensureBucketExists();

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(
                    file.getInputStream(), file.getSize()));

            log.debug("Stored file: bucket={}, key={}", bucket, key);
            return key;
        } catch (IOException e) {
            throw new StorageException("Błąd podczas zapisywania pliku: " + e.getMessage(), e);
        }
    }

    @Override
    public void storeBytes(byte[] data, String key, String contentType) {
        ensureBucketExists();
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .contentLength((long) data.length)
                        .build(),
                RequestBody.fromBytes(data));
        log.debug("Stored bytes: bucket={}, key={}", bucket, key);
    }

    @Override
    public String presignedUrl(String storageKey, int expirySeconds) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(expirySeconds))
                .getObjectRequest(r -> r.bucket(bucket).key(storageKey))
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    @Override
    public void delete(String storageKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(storageKey)
                    .build());
            log.debug("Deleted file: key={}", storageKey);
        } catch (S3Exception e) {
            log.warn("Failed to delete file key={}: {}", storageKey, e.getMessage());
        }
    }

    @Override
    public InputStream download(String storageKey) {
        return s3Client.getObjectAsBytes(GetObjectRequest.builder()
                .bucket(bucket)
                .key(storageKey)
                .build()).asInputStream();
    }

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            log.info("Created bucket: {}", bucket);
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
