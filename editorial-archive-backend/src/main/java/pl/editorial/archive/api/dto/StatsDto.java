package pl.editorial.archive.api.dto;

public record StatsDto(
    long totalPhotos,
    long approvedPhotos,
    long pendingPhotos,
    long rejectedPhotos,
    long totalUsers,
    long totalTags,
    long totalHierarchyNodes
) {}
