package pl.editorial.archive.domain.hierarchy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.editorial.archive.api.dto.HierarchyDtos;
import pl.editorial.archive.api.exception.BusinessException;
import pl.editorial.archive.api.exception.ResourceNotFoundException;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HierarchyService {

    private final HierarchyRepository hierarchyRepository;

    public List<HierarchyDtos.NodeResponse> getTree() {
        List<HierarchyNode> roots = hierarchyRepository.findByParentIsNullOrderByNameAsc();
        return roots.stream()
                .map(this::toResponseWithChildren)
                .toList();
    }

    public HierarchyDtos.NodeResponse getById(UUID id) {
        HierarchyNode node = findOrThrow(id);
        return toResponseWithChildren(node);
    }

    public List<HierarchyDtos.BreadcrumbResponse> getBreadcrumbs(UUID id) {
        findOrThrow(id);
        return hierarchyRepository.findBreadcrumbs(id).stream()
                .map(n -> new HierarchyDtos.BreadcrumbResponse(
                        n.getId().toString(), n.getName(), n.getSlug(), n.getLevel()))
                .toList();
    }

    @Transactional
    public HierarchyDtos.NodeResponse create(HierarchyDtos.CreateNodeRequest request) {
        HierarchyNode parent = null;
        short level = 0;

        if (request.parentId() != null) {
            parent = findOrThrow(UUID.fromString(request.parentId()));
            level = (short) (parent.getLevel() + 1);
        }

        String slug = toSlug(request.name());
        UUID parentId = parent != null ? parent.getId() : null;

        if (hierarchyRepository.findByParentIdAndSlug(parentId, slug).isPresent()) {
            throw new BusinessException("SLUG_CONFLICT",
                    "Węzeł o nazwie '" + request.name() + "' już istnieje w tym miejscu hierarchii");
        }

        HierarchyNode node = HierarchyNode.builder()
                .parent(parent)
                .name(request.name())
                .slug(slug)
                .level(level)
                .description(request.description())
                .build();

        return toResponse(hierarchyRepository.save(node));
    }

    @Transactional
    public HierarchyDtos.NodeResponse update(UUID id, HierarchyDtos.UpdateNodeRequest request) {
        HierarchyNode node = findOrThrow(id);
        node.setName(request.name());
        node.setSlug(toSlug(request.name()));
        node.setDescription(request.description());
        return toResponse(hierarchyRepository.save(node));
    }

    @Transactional
    public void delete(UUID id) {
        HierarchyNode node = findOrThrow(id);
        hierarchyRepository.delete(node);
    }

    // --- helpers ---

    private HierarchyNode findOrThrow(UUID id) {
        return hierarchyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HierarchyNode", id));
    }

    private HierarchyDtos.NodeResponse toResponseWithChildren(HierarchyNode node) {
        List<HierarchyDtos.NodeResponse> children = hierarchyRepository
                .findByParentIdOrderByNameAsc(node.getId())
                .stream()
                .map(this::toResponse)
                .toList();

        return new HierarchyDtos.NodeResponse(
                node.getId().toString(),
                node.getParent() != null ? node.getParent().getId().toString() : null,
                node.getName(),
                node.getSlug(),
                node.getLevel(),
                node.getDescription(),
                children
        );
    }

    private HierarchyDtos.NodeResponse toResponse(HierarchyNode node) {
        return new HierarchyDtos.NodeResponse(
                node.getId().toString(),
                node.getParent() != null ? node.getParent().getId().toString() : null,
                node.getName(),
                node.getSlug(),
                node.getLevel(),
                node.getDescription(),
                List.of()
        );
    }

    static String toSlug(String name) {
        String normalized = Normalizer.normalize(name.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
    }
}
