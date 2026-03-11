package pl.editorial.archive.domain.hierarchy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HierarchyRepository extends JpaRepository<HierarchyNode, UUID> {

    List<HierarchyNode> findByParentIsNullOrderByNameAsc();

    List<HierarchyNode> findByParentIdOrderByNameAsc(UUID parentId);

    Optional<HierarchyNode> findByParentIdAndSlug(UUID parentId, String slug);

    List<HierarchyNode> findByLevel(short level);

    @Query("""
        WITH RECURSIVE ancestors AS (
            SELECT h.* FROM hierarchy_nodes h WHERE h.id = :nodeId
            UNION ALL
            SELECT p.* FROM hierarchy_nodes p
            INNER JOIN ancestors a ON p.id = a.parent_id
        )
        SELECT * FROM ancestors ORDER BY level ASC
        """)
    List<HierarchyNode> findBreadcrumbs(@Param("nodeId") UUID nodeId);

    @Query("""
        WITH RECURSIVE descendants AS (
            SELECT id FROM hierarchy_nodes WHERE id = :nodeId
            UNION ALL
            SELECT h.id FROM hierarchy_nodes h
            INNER JOIN descendants d ON h.parent_id = d.id
        )
        SELECT id FROM descendants
        """)
    List<UUID> findAllDescendantIds(@Param("nodeId") UUID nodeId);
}
