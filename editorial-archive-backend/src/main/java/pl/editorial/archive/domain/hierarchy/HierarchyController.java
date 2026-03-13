package pl.editorial.archive.domain.hierarchy;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.editorial.archive.api.dto.HierarchyDtos;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hierarchy")
@RequiredArgsConstructor
@Tag(name = "Hierarchy", description = "Hierarchiczna struktura lokalizacji")
public class HierarchyController {

    private final HierarchyService hierarchyService;

    @GetMapping
    @Operation(summary = "Pobierz całe drzewo hierarchii (tylko korzenie + ich dzieci)")
    public ResponseEntity<List<HierarchyDtos.NodeResponse>> getTree() {
        return ResponseEntity.ok(hierarchyService.getTree());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Pobierz węzeł wraz z bezpośrednimi dziećmi")
    public ResponseEntity<HierarchyDtos.NodeResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(hierarchyService.getById(id));
    }

    @GetMapping("/{id}/breadcrumbs")
    @Operation(summary = "Ścieżka od korzenia do węzła (breadcrumbs)")
    public ResponseEntity<List<HierarchyDtos.BreadcrumbResponse>> getBreadcrumbs(
            @PathVariable UUID id) {
        return ResponseEntity.ok(hierarchyService.getBreadcrumbs(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Utwórz nowy węzeł hierarchii (Admin)")
    public ResponseEntity<HierarchyDtos.NodeResponse> create(
            @RequestBody HierarchyDtos.CreateNodeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hierarchyService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Edytuj węzeł hierarchii (Admin)")
    public ResponseEntity<HierarchyDtos.NodeResponse> update(
            @PathVariable UUID id,
            @RequestBody HierarchyDtos.UpdateNodeRequest request) {
        return ResponseEntity.ok(hierarchyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Usuń węzeł i wszystkich potomków (Admin)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        hierarchyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
