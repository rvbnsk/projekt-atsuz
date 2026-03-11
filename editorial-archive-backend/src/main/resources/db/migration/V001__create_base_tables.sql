-- Migracja V001 — Tabele podstawowe
-- The Editorial Archive

-- Rozszerzenia PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Użytkownicy
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    display_name  VARCHAR(100) NOT NULL,
    avatar_url    TEXT,
    role          VARCHAR(20) NOT NULL DEFAULT 'VIEWER'
                      CHECK (role IN ('VIEWER', 'CREATOR', 'ADMIN')),
    provider      VARCHAR(20) NOT NULL
                      CHECK (provider IN ('LOCAL', 'GOOGLE', 'FACEBOOK')),
    provider_id   VARCHAR(255),
    password_hash VARCHAR(255),
    is_blocked    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hierarchiczna struktura lokalizacji
CREATE TABLE hierarchy_nodes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id   UUID REFERENCES hierarchy_nodes(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(200) NOT NULL,
    level       SMALLINT NOT NULL
                    CHECK (level BETWEEN 0 AND 5),
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (parent_id, slug)
);

-- Tagi
CREATE TABLE tags (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- Zdjęcia / Materiały
CREATE TABLE photos (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    hierarchy_node_id UUID REFERENCES hierarchy_nodes(id) ON DELETE SET NULL,
    title             VARCHAR(300) NOT NULL,
    description       TEXT,
    accession_number  VARCHAR(50) UNIQUE,
    storage_key       TEXT NOT NULL,
    thumbnail_key     TEXT,
    medium_key        TEXT,
    original_filename VARCHAR(255),
    mime_type         VARCHAR(100),
    file_size_bytes   BIGINT,
    width_px          INTEGER,
    height_px         INTEGER,
    -- Metadane historyczne
    photo_date_from   DATE,
    photo_date_to     DATE,
    photo_date_label  VARCHAR(100),
    location_name     VARCHAR(300),
    latitude          DECIMAL(10,8),
    longitude         DECIMAL(11,8),
    rights_statement  VARCHAR(100) DEFAULT 'CC-BY-4.0',
    license_notes     TEXT,
    -- Statusy
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION')),
    rejection_reason  TEXT,
    -- Wyszukiwanie
    search_vector     TSVECTOR,
    view_count        BIGINT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Powiązania zdjęć z tagami
CREATE TABLE photo_tags (
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    tag_id   UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (photo_id, tag_id)
);

-- Log audytu
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id   UUID,
    details     JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tokeny odświeżające
CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
