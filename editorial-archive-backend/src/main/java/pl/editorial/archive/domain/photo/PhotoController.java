package pl.editorial.archive.domain.photo;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import pl.editorial.archive.api.dto.PhotoDtos;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/photos")
@RequiredArgsConstructor
@Tag(name = "Photos", description = "Zarządzanie zdjęciami i przeszukiwanie archiwum")
public class PhotoController {

    private final PhotoService photoService;

    // ── Public ────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Lista zatwierdzonych zdjęć (paginacja)")
    public ResponseEntity<Page<PhotoDtos.PhotoResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        Pageable pageable = toPageable(page, size, sort, direction);
        return ResponseEntity.ok(photoService.listApproved(pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Wyszukiwanie zaawansowane (FTS + filtry)")
    public ResponseEntity<Page<PhotoDtos.PhotoResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String nodeId,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radiusKm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PhotoDtos.PhotoSearchParams params = new PhotoDtos.PhotoSearchParams(
                q, nodeId, yearFrom, yearTo, tags, lat, lng, radiusKm);
        return ResponseEntity.ok(photoService.search(params, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Szczegóły zatwierdzonego zdjęcia")
    public ResponseEntity<PhotoDtos.PhotoResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(photoService.getById(id));
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Powiązane zdjęcia (ta sama lokalizacja lub epoka)")
    public ResponseEntity<List<PhotoDtos.PhotoResponse>> getRelated(@PathVariable UUID id) {
        return ResponseEntity.ok(photoService.getRelated(id));
    }

    @PostMapping("/{id}/view")
    @Operation(summary = "Inkrementuj licznik wyświetleń")
    public ResponseEntity<Void> incrementView(@PathVariable UUID id) {
        photoService.incrementViewCount(id);
        return ResponseEntity.noContent().build();
    }

    // ── Creator ───────────────────────────────────────────────────

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('CREATOR','ADMIN')")
    @Operation(summary = "Upload zdjęcia (multipart/form-data)")
    public ResponseEntity<PhotoDtos.PhotoResponse> upload(
            @RequestPart("file") MultipartFile file,
            @Valid @RequestPart("metadata") PhotoDtos.PhotoUploadRequest metadata,
            @AuthenticationPrincipal UUID uploaderId) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(photoService.upload(file, metadata, uploaderId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CREATOR','ADMIN')")
    @Operation(summary = "Moje zdjęcia (wszystkie statusy lub filtr po statusie)")
    public ResponseEntity<Page<PhotoDtos.PhotoResponse>> myPhotos(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PhotoStatus photoStatus = null;
        if (status != null && !status.isBlank()) {
            try { photoStatus = PhotoStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        return ResponseEntity.ok(photoService.getMyPhotos(userId, photoStatus, PageRequest.of(page, size)));
    }

    @GetMapping("/my/{id}")
    @PreAuthorize("hasAnyRole('CREATOR','ADMIN')")
    @Operation(summary = "Własne zdjęcie po ID (niezależnie od statusu)")
    public ResponseEntity<PhotoDtos.PhotoResponse> myPhotoById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(photoService.getMyPhotoById(id, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CREATOR','ADMIN')")
    @Operation(summary = "Edytuj metadane zdjęcia")
    public ResponseEntity<PhotoDtos.PhotoResponse> update(
            @PathVariable UUID id,
            @RequestBody PhotoDtos.PhotoUpdateRequest request,
            @AuthenticationPrincipal UUID userId,
            Authentication auth) {

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(photoService.updateMetadata(id, request, userId, isAdmin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CREATOR','ADMIN')")
    @Operation(summary = "Usuń własne zdjęcie")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId) {

        photoService.delete(id, userId, false);
        return ResponseEntity.noContent().build();
    }

    // ── Admin ─────────────────────────────────────────────────────

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kolejka moderacji")
    public ResponseEntity<Page<PhotoDtos.PhotoResponse>> pending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(photoService.getPending(PageRequest.of(page, size)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Zmień status zdjęcia (approve / reject / needs_correction)")
    public ResponseEntity<PhotoDtos.PhotoResponse> updateStatus(
            @PathVariable UUID id,
            @RequestBody PhotoDtos.StatusUpdateRequest request,
            @AuthenticationPrincipal UUID adminId) {

        return ResponseEntity.ok(photoService.updateStatus(id, request, adminId));
    }

    @DeleteMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Usuń dowolne zdjęcie (Admin)")
    public ResponseEntity<Void> adminDelete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID adminId) {

        photoService.delete(id, adminId, true);
        return ResponseEntity.noContent().build();
    }

    // ── helpers ───────────────────────────────────────────────────

    private Pageable toPageable(int page, int size, String sort, String direction) {
        Sort.Direction dir = "asc".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, Math.min(size, 100), Sort.by(dir, sort));
    }
}
