package pl.editorial.archive.domain.tag;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.editorial.archive.api.dto.PhotoDtos;
import pl.editorial.archive.api.exception.BusinessException;
import pl.editorial.archive.api.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;

    public List<PhotoDtos.TagDto> listAll() {
        return tagRepository.findAll().stream()
                .map(t -> new PhotoDtos.TagDto(t.getId().toString(), t.getName(), t.getSlug()))
                .toList();
    }

    public List<PhotoDtos.TagDto> suggest(String prefix) {
        return tagRepository.suggestByPrefix(prefix, PageRequest.of(0, 10)).stream()
                .map(t -> new PhotoDtos.TagDto(t.getId().toString(), t.getName(), t.getSlug()))
                .toList();
    }

    @Transactional
    public PhotoDtos.TagDto create(String name) {
        if (tagRepository.existsByName(name)) {
            throw new BusinessException("TAG_EXISTS", "Tag o nazwie '" + name + "' już istnieje");
        }
        String slug = name.toLowerCase().replaceAll("[^a-z0-9]+", "-");
        Tag tag = tagRepository.save(Tag.builder().name(name).slug(slug).build());
        return new PhotoDtos.TagDto(tag.getId().toString(), tag.getName(), tag.getSlug());
    }

    @Transactional
    public void delete(UUID id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", id));
        tagRepository.delete(tag);
    }
}
