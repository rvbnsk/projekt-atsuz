package pl.editorial.archive.api.exception;

import lombok.Getter;

@Getter
public class ResourceNotFoundException extends RuntimeException {
    private final String code;

    public ResourceNotFoundException(String resourceType, Object id) {
        super(resourceType + " o ID " + id + " nie istnieje");
        this.code = resourceType.toUpperCase().replace(" ", "_") + "_NOT_FOUND";
    }
}
