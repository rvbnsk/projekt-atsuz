package pl.editorial.archive.domain.tag;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findBySlug(String slug);

    Optional<Tag> findByName(String name);

    boolean existsByName(String name);

    List<Tag> findByNameContainingIgnoreCaseOrderByNameAsc(String query);

    @Query(value = """
        SELECT t.id, t.name, t.slug, COUNT(pt.photo_id) AS usage_count
        FROM tags t
        LEFT JOIN photo_tags pt ON pt.tag_id = t.id
        GROUP BY t.id, t.name, t.slug
        ORDER BY usage_count DESC
        """, nativeQuery = true)
    Page<Object[]> findAllWithUsageCount(Pageable pageable);

    @Query("SELECT t FROM Tag t WHERE LOWER(t.name) LIKE LOWER(CONCAT(:prefix, '%')) ORDER BY t.name ASC")
    List<Tag> suggestByPrefix(@Param("prefix") String prefix, Pageable pageable);
}
