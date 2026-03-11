package pl.editorial.archive.api.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.editorial.archive.api.dto.ApiResponse;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse.ErrorResponse> handleNotFound(
        ResourceNotFoundException ex, HttpServletRequest request
    ) {
        return buildError(HttpStatus.NOT_FOUND, ex.getCode(), ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse.ErrorResponse> handleForbidden(
        ForbiddenException ex, HttpServletRequest request
    ) {
        return buildError(HttpStatus.FORBIDDEN, ex.getCode(), ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse.ErrorResponse> handleBadCredentials(
        BadCredentialsException ex, HttpServletRequest request
    ) {
        return buildError(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
            "Nieprawidłowy email lub hasło", request.getRequestURI());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse.ErrorResponse> handleAccessDenied(
        AccessDeniedException ex, HttpServletRequest request
    ) {
        return buildError(HttpStatus.FORBIDDEN, "ACCESS_DENIED",
            "Brak uprawnień do tego zasobu", request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse.ErrorResponse> handleValidation(
        MethodArgumentNotValidException ex, HttpServletRequest request
    ) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        return buildError(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message, request.getRequestURI());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse.ErrorResponse> handleBusiness(
        BusinessException ex, HttpServletRequest request
    ) {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, ex.getCode(), ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse.ErrorResponse> handleGeneral(
        Exception ex, HttpServletRequest request
    ) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
            "Wystąpił nieoczekiwany błąd", request.getRequestURI());
    }

    private ResponseEntity<ApiResponse.ErrorResponse> buildError(
        HttpStatus status, String code, String message, String path
    ) {
        return ResponseEntity.status(status).body(
            new ApiResponse.ErrorResponse(
                new ApiResponse.ErrorDetail(code, message, Instant.now().toString(), path)
            )
        );
    }
}
