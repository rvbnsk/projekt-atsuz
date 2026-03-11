package pl.editorial.archive.domain.photo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, UUID> {

    Page<Photo> findByStatus(PhotoStatus status, Pageable pageable);

    Page<Photo> findByUploaderIdOrderByCreatedAtDesc(UUID uploaderId, Pageable pageable);

    @Query(value = """
        SELECT p.* FROM photos p
        WHERE p.status = 'APPROVED'
        AND (:#{#nodeIds == null || #nodeIds.isEmpty() ? 'true' : 'false'} = 'true'
             OR p.hierarchy_node_id = ANY(CAST(:nodeIdsStr AS uuid[])))
        AND (:yearFrom IS NULL OR EXTRACT(YEAR FROM p.photo_date_from) >= :yearFrom)
        AND (:yearTo IS NULL OR EXTRACT(YEAR FROM p.photo_date_from) <= :yearTo)
        ORDER BY p.created_at DESC
        """, nativeQuery = true)
    Page<Photo> findApprovedWithFilters(
        @Param("nodeIds") List<UUID> nodeIds,
        @Param("nodeIdsStr") String nodeIdsStr,
        @Param("yearFrom") Integer yearFrom,
        @Param("yearTo") Integer yearTo,
        Pageable pageable
    );

    @Query(value = """
        SELECT p.* FROM photos p
        WHERE p.status = 'APPROVED'
        AND p.search_vector @@ plainto_tsquery('simple', :query)
        ORDER BY ts_rank(p.search_vector, plainto_tsquery('simple', :query)) DESC
        """, nativeQuery = true)
    Page<Photo> fullTextSearch(@Param("query") String query, Pageable pageable);

    @Query(value = """
        SELECT p.* FROM photos p
        WHERE p.status = 'APPROVED'
        AND p.id != :photoId
        AND (p.hierarchy_node_id = :nodeId
             OR EXTRACT(YEAR FROM p.photo_date_from) = :year)
        ORDER BY p.view_count DESC
        LIMIT 6
        """, nativeQuery = true)
    List<Photo> findRelated(
        @Param("photoId") UUID photoId,
        @Param("nodeId") UUID nodeId,
        @Param("year") Integer year
    );

    @Modifying
    @Query("UPDATE Photo p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") UUID id);

    long countByStatus(PhotoStatus status);
}
