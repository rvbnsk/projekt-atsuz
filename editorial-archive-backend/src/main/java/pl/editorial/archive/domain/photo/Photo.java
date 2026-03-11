package pl.editorial.archive.domain.photo;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import pl.editorial.archive.domain.hierarchy.HierarchyNode;
import pl.editorial.archive.domain.tag.Tag;
import pl.editorial.archive.domain.user.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id")
    private User uploader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hierarchy_node_id")
    private HierarchyNode hierarchyNode;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "accession_number", length = 50, unique = true)
    private String accessionNumber;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "thumbnail_key")
    private String thumbnailKey;

    @Column(name = "medium_key")
    private String mediumKey;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "width_px")
    private Integer widthPx;

    @Column(name = "height_px")
    private Integer heightPx;

    @Column(name = "photo_date_from")
    private LocalDate photoDateFrom;

    @Column(name = "photo_date_to")
    private LocalDate photoDateTo;

    @Column(name = "photo_date_label", length = 100)
    private String photoDateLabel;

    @Column(name = "location_name", length = 300)
    private String locationName;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "rights_statement", length = 100)
    @Builder.Default
    private String rightsStatement = "CC-BY-4.0";

    @Column(name = "license_notes", columnDefinition = "TEXT")
    private String licenseNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PhotoStatus status = PhotoStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private long viewCount = 0L;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "photo_tags",
        joinColumns = @JoinColumn(name = "photo_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
