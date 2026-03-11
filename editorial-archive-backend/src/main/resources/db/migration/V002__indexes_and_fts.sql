-- Migracja V002 — Indeksy i Full-text Search

-- Indeksy wydajnościowe
CREATE INDEX idx_photos_hierarchy    ON photos(hierarchy_node_id);
CREATE INDEX idx_photos_uploader     ON photos(uploader_id);
CREATE INDEX idx_photos_status       ON photos(status);
CREATE INDEX idx_photos_location     ON photos(latitude, longitude);
CREATE INDEX idx_photos_date         ON photos(photo_date_from, photo_date_to);
CREATE INDEX idx_photos_search       ON photos USING GIN(search_vector);
CREATE INDEX idx_photos_view_count   ON photos(view_count DESC);
CREATE INDEX idx_hierarchy_parent    ON hierarchy_nodes(parent_id);
CREATE INDEX idx_hierarchy_slug      ON hierarchy_nodes(slug);
CREATE INDEX idx_hierarchy_level     ON hierarchy_nodes(level);
CREATE INDEX idx_audit_actor         ON audit_logs(actor_id);
CREATE INDEX idx_audit_target        ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_created       ON audit_logs(created_at DESC);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_exp  ON refresh_tokens(expires_at);
CREATE INDEX idx_tags_slug           ON tags(slug);
CREATE INDEX idx_users_email         ON users(email);
CREATE INDEX idx_users_provider      ON users(provider, provider_id);

-- Automatyczna aktualizacja search_vector
CREATE OR REPLACE FUNCTION update_photo_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.location_name, '')), 'C') ||
        setweight(to_tsvector('simple', COALESCE(NEW.photo_date_label, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_photo_search_vector
    BEFORE INSERT OR UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_photo_search_vector();

-- Automatyczna aktualizacja updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sekwencja dla accession_number (format ARC-XXXXX)
CREATE SEQUENCE IF NOT EXISTS accession_number_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_accession_number() RETURNS trigger AS $$
BEGIN
    IF NEW.accession_number IS NULL THEN
        NEW.accession_number := 'ARC-' || LPAD(nextval('accession_number_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_photo_accession_number
    BEFORE INSERT ON photos
    FOR EACH ROW EXECUTE FUNCTION generate_accession_number();
