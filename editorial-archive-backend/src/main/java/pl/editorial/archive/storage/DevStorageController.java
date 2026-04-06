package pl.editorial.archive.storage;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev/files")
@ConditionalOnProperty(name = "app.storage.use-stub", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class DevStorageController {

    private final StubStorageService stubStorageService;

    @GetMapping("/**")
    public ResponseEntity<byte[]> getFile(HttpServletRequest request) {
        String key = request.getRequestURI().substring("/api/dev/files/".length());
        byte[] data = stubStorageService.getBytes(key);
        if (data == null) return ResponseEntity.notFound().build();
        MediaType mediaType = MediaType.parseMediaType(stubStorageService.getContentType(key));
        return ResponseEntity.ok().contentType(mediaType).body(data);
    }
}
