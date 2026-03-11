package pl.editorial.archive.api.dto;

import java.util.List;

public class ApiResponse {

    public record PagedResponse<T>(
        List<T> data,
        PaginationMeta pagination,
        String timestamp
    ) {}

    public record PaginationMeta(
        int page,
        int size,
        long totalElements,
        int totalPages
    ) {}

    public record ErrorResponse(
        ErrorDetail error
    ) {}

    public record ErrorDetail(
        String code,
        String message,
        String timestamp,
        String path
    ) {}

    public record SuccessResponse<T>(
        T data,
        String timestamp
    ) {}
}
