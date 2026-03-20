package pl.editorial.archive.domain.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.editorial.archive.api.dto.StatsDto;
import pl.editorial.archive.domain.hierarchy.HierarchyRepository;
import pl.editorial.archive.domain.photo.PhotoRepository;
import pl.editorial.archive.domain.photo.PhotoStatus;
import pl.editorial.archive.domain.tag.TagRepository;
import pl.editorial.archive.domain.user.UserRepository;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final AuditLogRepository auditLogRepository;
    private final PhotoRepository photoRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final HierarchyRepository hierarchyRepository;

    public Page<AuditLog> getAuditLog(UUID actorId, String action,
                                      Instant from, Instant to, Pageable pageable) {
        return auditLogRepository.findWithFilters(actorId, action, from, to, pageable);
    }

    public StatsDto getStats() {
        return new StatsDto(
                photoRepository.count(),
                photoRepository.countByStatus(PhotoStatus.APPROVED),
                photoRepository.countByStatus(PhotoStatus.PENDING),
                photoRepository.countByStatus(PhotoStatus.REJECTED),
                userRepository.count(),
                tagRepository.count(),
                hierarchyRepository.count()
        );
    }
}
