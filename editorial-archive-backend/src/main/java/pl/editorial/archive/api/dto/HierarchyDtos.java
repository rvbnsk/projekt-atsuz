package pl.editorial.archive.api.dto;

import java.util.List;

public class HierarchyDtos {

    public record NodeResponse(
        String id,
        String parentId,
        String name,
        String slug,
        int level,
        String description,
        List<NodeResponse> children
    ) {}

    public record BreadcrumbResponse(
        String id,
        String name,
        String slug,
        int level
    ) {}

    public record CreateNodeRequest(
        String parentId,
        String name,
        String description
    ) {}

    public record UpdateNodeRequest(
        String name,
        String description
    ) {}
}
