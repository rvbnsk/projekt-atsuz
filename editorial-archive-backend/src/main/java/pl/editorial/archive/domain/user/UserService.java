package pl.editorial.archive.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.editorial.archive.api.dto.UserDtos;
import pl.editorial.archive.api.exception.BusinessException;
import pl.editorial.archive.api.exception.ResourceNotFoundException;
import pl.editorial.archive.domain.audit.AuditService;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public Page<UserDtos.UserResponse> list(Pageable pageable) {
        return userRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toResponse);
    }

    public UserDtos.UserResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public UserDtos.UserResponse setBlocked(UUID id, boolean blocked, UUID actorId) {
        User user = findOrThrow(id);
        if (user.getRole() == UserRole.ADMIN) {
            throw new BusinessException("CANNOT_BLOCK_ADMIN", "Nie można zablokować administratora");
        }
        user.setBlocked(blocked);
        auditService.log(actorId, blocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
                "USER", id, Map.of("email", user.getEmail()));
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDtos.UserResponse changeRole(UUID id, String roleName, UUID actorId) {
        User user = findOrThrow(id);
        UserRole newRole;
        try {
            newRole = UserRole.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_ROLE", "Nieznana rola: " + roleName);
        }
        UserRole oldRole = user.getRole();
        user.setRole(newRole);
        auditService.log(actorId, "USER_ROLE_CHANGED", "USER", id,
                Map.of("from", oldRole.name(), "to", newRole.name()));
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(UUID id, UUID actorId) {
        User user = findOrThrow(id);
        if (user.getRole() == UserRole.ADMIN) {
            throw new BusinessException("CANNOT_DELETE_ADMIN", "Nie można usunąć administratora");
        }
        auditService.log(actorId, "USER_DELETED", "USER", id,
                Map.of("email", user.getEmail()));
        userRepository.delete(user);
    }

    private User findOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private UserDtos.UserResponse toResponse(User u) {
        return new UserDtos.UserResponse(
                u.getId().toString(),
                u.getEmail(),
                u.getDisplayName(),
                u.getAvatarUrl(),
                u.getRole(),
                u.getProvider(),
                u.isBlocked(),
                u.getCreatedAt()
        );
    }
}
