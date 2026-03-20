package pl.editorial.archive.domain.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.editorial.archive.api.dto.UserDtos;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Zarządzanie użytkownikami (Admin)")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Lista użytkowników")
    public ResponseEntity<Page<UserDtos.UserResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.list(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Profil użytkownika")
    public ResponseEntity<UserDtos.UserResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PatchMapping("/{id}/block")
    @Operation(summary = "Zablokuj lub odblokuj użytkownika")
    public ResponseEntity<UserDtos.UserResponse> block(
            @PathVariable UUID id,
            @RequestBody UserDtos.BlockRequest request,
            @AuthenticationPrincipal UUID adminId) {
        return ResponseEntity.ok(userService.setBlocked(id, request.blocked(), adminId));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Zmień rolę użytkownika")
    public ResponseEntity<UserDtos.UserResponse> changeRole(
            @PathVariable UUID id,
            @RequestBody UserDtos.RoleChangeRequest request,
            @AuthenticationPrincipal UUID adminId) {
        return ResponseEntity.ok(userService.changeRole(id, request.role(), adminId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Usuń konto użytkownika")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID adminId) {
        userService.delete(id, adminId);
        return ResponseEntity.noContent().build();
    }
}
