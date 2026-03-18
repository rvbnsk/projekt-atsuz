package pl.editorial.archive.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import pl.editorial.archive.domain.photo.Photo;
import pl.editorial.archive.domain.photo.PhotoRepository;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageProcessingService {

    private static final int THUMBNAIL_SIZE = 400;
    private static final int MEDIUM_SIZE    = 1200;
    private static final float THUMBNAIL_QUALITY = 0.80f;
    private static final float MEDIUM_QUALITY    = 0.85f;

    private final StorageService storageService;
    private final PhotoRepository photoRepository;

    /**
     * Generuje miniaturkę (400px) i wersję medium (1200px) asynchronicznie.
     * Aktualizuje encję Photo po zakończeniu.
     */
    @Async("imageProcessingExecutor")
    public void generateAndStoreThumbnails(UUID photoId, String originalStorageKey) {
        try {
            byte[] original = storageService.download(originalStorageKey).readAllBytes();
            if (original.length == 0) {
                log.debug("Stub storage — skipping thumbnail generation for photo {}", photoId);
                return;
            }

            String thumbnailKey = processAndStore(original, photoId, "thumbnail", THUMBNAIL_SIZE, THUMBNAIL_QUALITY);
            String mediumKey    = processAndStore(original, photoId, "medium",    MEDIUM_SIZE,    MEDIUM_QUALITY);

            photoRepository.findById(photoId).ifPresent(photo -> {
                photo.setThumbnailKey(thumbnailKey);
                photo.setMediumKey(mediumKey);
                extractDimensions(original, photo);
                photoRepository.save(photo);
                log.info("Thumbnails generated for photo {}", photoId);
            });
        } catch (Exception e) {
            log.error("Failed to generate thumbnails for photo {}: {}", photoId, e.getMessage(), e);
        }
    }

    private String processAndStore(byte[] imageData, UUID photoId,
                                   String variant, int maxSize, float quality) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Thumbnails.of(new ByteArrayInputStream(imageData))
                .size(maxSize, maxSize)
                .keepAspectRatio(true)
                .outputFormat("JPEG")
                .outputQuality(quality)
                .toOutputStream(out);

        byte[] result = out.toByteArray();
        String key = "photos/" + photoId + "/" + variant + ".jpg";

        storageService.storeBytes(result, key, "image/jpeg");
        return key;
    }

    private void extractDimensions(byte[] imageData, Photo photo) {
        try {
            var size = Thumbnails.of(new ByteArrayInputStream(imageData))
                    .scale(1.0)
                    .asBufferedImage();
            photo.setWidthPx(size.getWidth());
            photo.setHeightPx(size.getHeight());
        } catch (IOException e) {
            log.warn("Could not extract dimensions: {}", e.getMessage());
        }
    }
}
