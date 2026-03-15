package pl.editorial.archive.domain.photo;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pl.editorial.archive.api.dto.PhotoDtos;
import pl.editorial.archive.api.exception.BusinessException;
import pl.editorial.archive.api.exception.ForbiddenException;
import pl.editorial.archive.api.exception.ResourceNotFoundException;
import pl.editorial.archive.domain.audit.AuditService;
import pl.editorial.archive.domain.hierarchy.HierarchyNode;
import pl.editorial.archive.domain.hierarchy.HierarchyRepository;
import pl.editorial.archive.domain.tag.Tag;
import pl.editorial.archive.domain.tag.TagRepository;
import pl.editorial.archive.domain.user.User;
import pl.editorial.archive.domain.user.UserRepository;
import pl.editorial.archive.storage.StorageService;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final UserRepository userRepository;
    private final HierarchyRepository hierarchyRepository;
    private final TagRepository tagRepository;
    private final StorageService storageService;
    private final AuditService auditService;

    // ── Public ────────────────────────────────────────────────────

    public Page<PhotoDtos.PhotoResponse> listApproved(Pageable pageable) {
        return photoRepository.findByStatus(PhotoStatus.APPROVED, pageable)
                .map(this::toResponse);
    }

    public Page<PhotoDtos.PhotoResponse> search(PhotoDtos.PhotoSearchParams params, Pageable pageable) {
        boolean hasQuery = params.q() != null && !params.q().isBlank();

        if (hasQuery) {
            return photoRepository.fullTextSearch(params.q().trim(), pageable)
                    .map(this::toResponse);
        }

        List<UUID> nodeIds = resolveNodeIds(params.nodeId());
        String nodeIdsStr = nodeIds.isEmpty() ? null
                : "{" + String.join(",", nodeIds.stream().map(UUID::toString).toList()) + "}";

        return photoRepository.findApprovedWithFilters(
                nodeIds.isEmpty() ? null : nodeIds,
                nodeIdsStr,
                params.yearFrom(),
                params.yearTo(),
                pageable
        ).map(this::toResponse);
    }

    public PhotoDtos.PhotoResponse getById(UUID id) {
        Photo photo = findApprovedOrThrow(id);
        return toResponse(photo);
    }

    public List<PhotoDtos.PhotoResponse> getRelated(UUID id) {
        Photo photo = findApprovedOrThrow(id);
        UUID nodeId = photo.getHierarchyNode() != null ? photo.getHierarchyNode().getId() : null;
        Integer year = photo.getPhotoDateFrom() != null ? photo.getPhotoDateFrom().getYear() : null;

        if (nodeId == null && year == null) return List.of();

        return photoRepository.findRelated(id, nodeId, year).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void incrementViewCount(UUID id) {
        if (!photoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Photo", id);
        }
        photoRepository.incrementViewCount(id);
    }

    // ── Creator ───────────────────────────────────────────────────

    @Transactional
    public PhotoDtos.PhotoResponse upload(MultipartFile file, PhotoDtos.PhotoUploadRequest request,
                                          UUID uploaderId) {
        validateFileType(file);

        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", uploaderId));

        String storageKey = storageService.store(file, "photos/" + uploaderId);

        Photo photo = Photo.builder()
                .uploader(uploader)
                .title(request.title())
                .description(request.description())
                .storageKey(storageKey)
                .originalFilename(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .status(PhotoStatus.PENDING)
                .build();

        applyMetadata(photo, request.nodeId(), request.tags(),
                request.photoDateFrom(), request.photoDateTo(), request.photoDateLabel(),
                request.locationName(), request.latitude(), request.longitude(),
                request.rightsStatement(), null);

        Photo saved = photoRepository.save(photo);
        auditService.log(uploaderId, "PHOTO_UPLOADED", "PHOTO", saved.getId(), null);
        return toResponse(saved);
    }

    public Page<PhotoDtos.PhotoResponse> getMyPhotos(UUID uploaderId, Pageable pageable) {
        return photoRepository.findByUploaderIdOrderByCreatedAtDesc(uploaderId, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public PhotoDtos.PhotoResponse updateMetadata(UUID id, PhotoDtos.PhotoUpdateRequest request,
                                                  UUID currentUserId, boolean isAdmin) {
        Photo photo = findOrThrow(id);
        assertCanModify(photo, currentUserId, isAdmin);

        photo.setTitle(request.title());
        photo.setDescription(request.description());
        photo.setLicenseNotes(request.licenseNotes());

        applyMetadata(photo, request.nodeId(), request.tags(),
                request.photoDateFrom(), request.photoDateTo(), request.photoDateLabel(),
                request.locationName(), request.latitude(), request.longitude(),
                request.rightsStatement(), request.licenseNotes());

        auditService.log(currentUserId, "PHOTO_METADATA_UPDATED", "PHOTO", id, null);
        return toResponse(photoRepository.save(photo));
    }

    @Transactional
    public void delete(UUID id, UUID currentUserId, boolean isAdmin) {
        Photo photo = findOrThrow(id);
        assertCanModify(photo, currentUserId, isAdmin);

        storageService.delete(photo.getStorageKey());
        if (photo.getThumbnailKey() != null) storageService.delete(photo.getThumbnailKey());
        if (photo.getMediumKey() != null) storageService.delete(photo.getMediumKey());

        photoRepository.delete(photo);
        auditService.log(currentUserId, "PHOTO_DELETED", "PHOTO", id, null);
    }

    // ── Admin ─────────────────────────────────────────────────────

    public Page<PhotoDtos.PhotoResponse> getPending(Pageable pageable) {
        return photoRepository.findByStatus(PhotoStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public PhotoDtos.PhotoResponse updateStatus(UUID id, PhotoDtos.StatusUpdateRequest request,
                                                UUID actorId) {
        Photo photo = findOrThrow(id);

        PhotoStatus newStatus;
        try {
            newStatus = PhotoStatus.valueOf(request.status());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_STATUS", "Nieznany status: " + request.status());
        }

        photo.setStatus(newStatus);
        photo.setRejectionReason(
                newStatus == PhotoStatus.REJECTED || newStatus == PhotoStatus.NEEDS_CORRECTION
                        ? request.rejectionReason()
                        : null
        );

        auditService.log(actorId, "PHOTO_STATUS_CHANGED", "PHOTO", id,
                Map.of("newStatus", newStatus.name()));
        return toResponse(photoRepository.save(photo));
    }

    // ── Helpers ───────────────────────────────────────────────────

    private void applyMetadata(Photo photo, String nodeId, List<String> tagNames,
                               String dateFrom, String dateTo, String dateLabel,
                               String locationName, java.math.BigDecimal lat,
                               java.math.BigDecimal lng, String rights, String licenseNotes) {
        if (nodeId != null) {
            HierarchyNode node = hierarchyRepository.findById(UUID.fromString(nodeId))
                    .orElseThrow(() -> new ResourceNotFoundException("HierarchyNode", nodeId));
            photo.setHierarchyNode(node);
        }

        if (tagNames != null && !tagNames.isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            for (String name : tagNames) {
                String slug = name.toLowerCase().replaceAll("[^a-z0-9]+", "-");
                Tag tag = tagRepository.findBySlug(slug).orElseGet(() ->
                        tagRepository.save(Tag.builder().name(name).slug(slug).build()));
                tags.add(tag);
            }
            photo.setTags(tags);
        }

        if (dateFrom != null) photo.setPhotoDateFrom(java.time.LocalDate.parse(dateFrom));
        if (dateTo != null) photo.setPhotoDateTo(java.time.LocalDate.parse(dateTo));
        photo.setPhotoDateLabel(dateLabel);
        photo.setLocationName(locationName);
        photo.setLatitude(lat);
        photo.setLongitude(lng);
        if (rights != null) photo.setRightsStatement(rights);
        if (licenseNotes != null) photo.setLicenseNotes(licenseNotes);
    }

    private List<UUID> resolveNodeIds(String nodeId) {
        if (nodeId == null) return List.of();
        UUID id = UUID.fromString(nodeId);
        return hierarchyRepository.findAllDescendantIds(id);
    }

    private void validateFileType(MultipartFile file) {
        String mime = file.getContentType();
        if (mime == null || !Set.of(
                "image/jpeg", "image/png", "image/tiff", "image/webp"
        ).contains(mime)) {
            throw new BusinessException("UNSUPPORTED_FILE_TYPE",
                    "Obsługiwane formaty: JPG, PNG, TIFF, WebP");
        }
        if (file.getSize() > 50L * 1024 * 1024) {
            throw new BusinessException("FILE_TOO_LARGE", "Maksymalny rozmiar pliku: 50 MB");
        }
    }

    private void assertCanModify(Photo photo, UUID currentUserId, boolean isAdmin) {
        if (!isAdmin && !photo.getUploader().getId().equals(currentUserId)) {
            throw new ForbiddenException("PHOTO_NOT_OWNED",
                    "Możesz modyfikować tylko własne zdjęcia");
        }
    }

    private Photo findOrThrow(UUID id) {
        return photoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Photo", id));
    }

    private Photo findApprovedOrThrow(UUID id) {
        Photo photo = findOrThrow(id);
        if (photo.getStatus() != PhotoStatus.APPROVED) {
            throw new ResourceNotFoundException("Photo", id);
        }
        return photo;
    }

    PhotoDtos.PhotoResponse toResponse(Photo p) {
        String thumbnailUrl = p.getThumbnailKey() != null
                ? storageService.presignedUrl(p.getThumbnailKey(), 3600)
                : null;
        String mediumUrl = p.getMediumKey() != null
                ? storageService.presignedUrl(p.getMediumKey(), 3600)
                : null;

        List<PhotoDtos.TagDto> tags = p.getTags().stream()
                .map(t -> new PhotoDtos.TagDto(t.getId().toString(), t.getName(), t.getSlug()))
                .toList();

        return new PhotoDtos.PhotoResponse(
                p.getId().toString(),
                p.getUploader() != null ? p.getUploader().getId().toString() : null,
                p.getUploader() != null ? p.getUploader().getDisplayName() : null,
                p.getHierarchyNode() != null ? p.getHierarchyNode().getId().toString() : null,
                p.getHierarchyNode() != null ? p.getHierarchyNode().getName() : null,
                p.getTitle(),
                p.getDescription(),
                p.getAccessionNumber(),
                thumbnailUrl,
                mediumUrl,
                p.getOriginalFilename(),
                p.getMimeType(),
                p.getFileSizeBytes(),
                p.getWidthPx(),
                p.getHeightPx(),
                p.getPhotoDateFrom() != null ? p.getPhotoDateFrom().toString() : null,
                p.getPhotoDateTo() != null ? p.getPhotoDateTo().toString() : null,
                p.getPhotoDateLabel(),
                p.getLocationName(),
                p.getLatitude(),
                p.getLongitude(),
                p.getRightsStatement(),
                p.getLicenseNotes(),
                p.getStatus(),
                p.getRejectionReason(),
                p.getViewCount(),
                tags,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
