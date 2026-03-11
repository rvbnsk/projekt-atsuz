-- Migracja V003 — Dane inicjalne (seed)
-- Przykładowa hierarchia lokalizacji dla Polski

-- Poziom 0 — Kraj
INSERT INTO hierarchy_nodes (id, parent_id, name, slug, level, description) VALUES
('00000000-0000-0000-0000-000000000001', NULL, 'Polska', 'polska', 0, 'Archiwum fotograficzne z terenu Polski');

-- Poziom 1 — Województwa
INSERT INTO hierarchy_nodes (id, parent_id, name, slug, level) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Mazowieckie', 'mazowieckie', 1),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Małopolskie', 'malopolskie', 1),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Śląskie', 'slaskie', 1),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Wielkopolskie', 'wielkopolskie', 1),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'Dolnośląskie', 'dolnoslaskie', 1);

-- Poziom 2 — Miasta
INSERT INTO hierarchy_nodes (id, parent_id, name, slug, level) VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'Warszawa', 'warszawa', 2),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', 'Kraków', 'krakow', 2),
('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', 'Katowice', 'katowice', 2),
('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000004', 'Poznań', 'poznan', 2),
('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', 'Wrocław', 'wroclaw', 2);

-- Poziom 3 — Dzielnice Warszawy
INSERT INTO hierarchy_nodes (id, parent_id, name, slug, level) VALUES
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', 'Śródmieście', 'srodmiescie', 3),
('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001', 'Praga-Południe', 'praga-poludnie', 3),
('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000001', 'Mokotów', 'mokotow', 3),
('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000001', 'Wola', 'wola', 3);

-- Poziom 3 — Dzielnice Krakowa
INSERT INTO hierarchy_nodes (id, parent_id, name, slug, level) VALUES
('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000002', 'Stare Miasto', 'stare-miasto', 3),
('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000002', 'Podgórze', 'podgorze', 3),
('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000002', 'Krowodrza', 'krowodrza', 3);

-- Tagi inicjalne
INSERT INTO tags (name, slug) VALUES
('architektura', 'architektura'),
('ulica', 'ulica'),
('ludzie', 'ludzie'),
('transport', 'transport'),
('przyroda', 'przyroda'),
('wydarzenia', 'wydarzenia'),
('sport', 'sport'),
('kultura', 'kultura'),
('wojsko', 'wojsko'),
('przemysł', 'przemysl'),
('szkolnictwo', 'szkolnictwo'),
('kościół', 'kosciol'),
('rynek', 'rynek'),
('most', 'most'),
('park', 'park');

-- Domyślny administrator (hasło do zmiany po pierwszym uruchomieniu)
-- Hasło: Admin@1234 (BCrypt hash)
INSERT INTO users (email, display_name, role, provider, password_hash) VALUES
('admin@editorial-archive.pl', 'Administrator', 'ADMIN', 'LOCAL',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdRGZ/K3x/6x3.W');
