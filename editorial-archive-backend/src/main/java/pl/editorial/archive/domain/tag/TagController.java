package pl.editorial.archive.domain.tag;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.editorial.archive.api.dto.PhotoDtos;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tags", description = "Zarządzanie tagami")
public class TagController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Wszystkie tagi")
    public ResponseEntity<List<PhotoDtos.TagDto>> listAll() {
        return ResponseEntity.ok(tagService.listAll());
    }

    @GetMapping("/suggest")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Autocomplete tagów (prefix)")
    public ResponseEntity<List<PhotoDtos.TagDto>> suggest(@RequestParam String q) {
        return ResponseEntity.ok(tagService.suggest(q));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Utwórz nowy tag (Admin)")
    public ResponseEntity<PhotoDtos.TagDto> create(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tagService.create(body.get("name")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Usuń tag (Admin)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        tagService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
