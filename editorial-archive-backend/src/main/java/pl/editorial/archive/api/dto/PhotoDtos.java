package pl.editorial.archive.api.dto;

import jakarta.validation.constraints.NotBlank;
import pl.editorial.archive.domain.photo.PhotoStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class PhotoDtos {

    public record PhotoResponse(
        String id,
        String uploaderId,
        String uploaderName,
        String hierarchyNodeId,
        String hierarchyNodeName,
        String title,
        String description,
        String accessionNumber,
        String thumbnailUrl,
        String mediumUrl,
        String originalFilename,
        String mimeType,
        Long fileSizeBytes,
        Integer widthPx,
        Integer heightPx,
        String photoDateFrom,
        String photoDateTo,
        String photoDateLabel,
        String locationName,
        BigDecimal latitude,
        BigDecimal longitude,
        String rightsStatement,
        String licenseNotes,
        PhotoStatus status,
        String rejectionReason,
        long viewCount,
        List<TagDto> tags,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record TagDto(String id, String name, String slug) {}

    public record PhotoUploadRequest(
        @NotBlank(message = "Tytuł nie może być pusty")
        String title,
        String description,
        String nodeId,
        List<String> tags,
        String photoDateFrom,
        String photoDateTo,
        String photoDateLabel,
        String locationName,
        BigDecimal latitude,
        BigDecimal longitude,
        String rightsStatement
    ) {}

    public record PhotoUpdateRequest(
        String title,
        String description,
        String nodeId,
        List<String> tags,
        String photoDateFrom,
        String photoDateTo,
        String photoDateLabel,
        String locationName,
        BigDecimal latitude,
        BigDecimal longitude,
        String rightsStatement,
        String licenseNotes
    ) {}

    public record StatusUpdateRequest(
        String status,
        String rejectionReason
    ) {}

    public record PhotoSearchParams(
        String q,
        String nodeId,
        Integer yearFrom,
        Integer yearTo,
        List<String> tags,
        Double lat,
        Double lng,
        Double radiusKm
    ) {}
}
