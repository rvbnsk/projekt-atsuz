# The Editorial Archive

Platforma do przechowywania, przeglądania i wyszukiwania historycznych zdjęć, zorganizowanych w hierarchiczną strukturę lokalizacji.

---

## Stack technologiczny

| Warstwa | Technologie |
|---------|-------------|
| **Frontend** | React 18 + TypeScript, Vite, Tailwind CSS, React Query, Zustand, Axios |
| **Backend** | Spring Boot 3.2, Spring Security + JWT, Spring Data JPA, MapStruct |
| **Baza danych** | PostgreSQL 15, Flyway (migracje), Full-text Search (tsvector) |
| **Przechowywanie plików** | MinIO (S3-compatible) / AWS S3 |
| **Auth** | JWT (access + refresh token rotation), OAuth2 (Google, Facebook) |
| **Konteneryzacja** | Docker, Docker Compose |

---

## Architektura

```
frontend (React)  ──REST API──►  backend (Spring Boot)  ──JDBC──►  PostgreSQL
                                         │
                                         ▼
                                   MinIO / S3
```

---

### Wymagania

- **Docker Desktop** 4.x+
- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+** + **npm**

### 1. Baza danych (PostgreSQL + MinIO)

```bash
docker compose -f docker-compose.dev.yml up -d
```

- PostgreSQL: `localhost:5432`
- MinIO Console: http://localhost:9001 (login: `minioadmin` / `minioadmin`)

### 2. Konfiguracja i uruchomienie backendu

```bash
cd editorial-archive-backend
mvn spring-boot:run
```

### 3. Konfiguracja i uruchomienie frontend

```bash
cd editorial-archive-frontend
npm install
npm run dev
```

Frontend dostępny na: http://localhost:5173

---

## Endpointy API (v1)

| Grupa | Metoda | Endpoint | Auth |
|-------|--------|----------|------|
| Auth | POST | `/api/v1/auth/register` | Public |
| Auth | POST | `/api/v1/auth/login` | Public |
| Auth | POST | `/api/v1/auth/refresh` | Public |
| Auth | POST | `/api/v1/auth/logout` | Wymagana |
| Auth | GET | `/api/v1/auth/me` | Wymagana |
| Zdjęcia | GET | `/api/v1/photos` | Public |
| Zdjęcia | GET | `/api/v1/photos/search` | Public |
| Zdjęcia | POST | `/api/v1/photos` | CREATOR+ |
| Zdjęcia | PATCH | `/api/v1/photos/{id}/status` | ADMIN |
| Hierarchia | GET | `/api/v1/hierarchy` | Public |
| Hierarchia | GET | `/api/v1/hierarchy/{id}` | Public |
| Hierarchia | GET | `/api/v1/hierarchy/{id}/breadcrumbs` | Public |
| Hierarchia | POST | `/api/v1/hierarchy` | ADMIN |
| Hierarchia | PUT | `/api/v1/hierarchy/{id}` | ADMIN |
| Hierarchia | DELETE | `/api/v1/hierarchy/{id}` | ADMIN |
| Tagi | GET | `/api/v1/tags` | Public |
| Admin | GET | `/api/v1/admin/audit` | ADMIN |
| Admin | GET | `/api/v1/admin/stats` | ADMIN |
| Auth | GET | `/oauth2/authorization/google` | Public |
| Auth | GET | `/oauth2/authorization/facebook` | Public |
| Użytkownicy | GET | `/api/v1/users` | ADMIN |
| Użytkownicy | PATCH | `/api/v1/users/{id}/block` | ADMIN |
| Użytkownicy | PATCH | `/api/v1/users/{id}/role` | ADMIN |
| Użytkownicy | DELETE | `/api/v1/users/{id}` | ADMIN |

Pełna dokumentacja: http://localhost:8080/swagger-ui.html

---

## Role użytkowników

| Rola | Opis |
|------|------|
| `VIEWER` | Anonimowy przeglądający — tylko odczyt |
| `CREATOR` | Zalogowany twórca — może przesyłać i edytować własne zdjęcia |
| `ADMIN` | Administrator — pełny dostęp, moderacja, zarządzanie użytkownikami |

---

## Prod

```bash
cp editorial-archive-backend/.env.example .env

docker compose up -d

docker compose logs -f backend
```

---

## Model danych (schemat bazy)

Baza zawiera tabele:
- `users` — konta użytkowników (lokalne + OAuth2)
- `hierarchy_nodes` — hierarchia lokalizacji (kraj → województwo → miasto → dzielnica)
- `photos` — zdjęcia z metadanymi historycznymi + FTS (tsvector)
- `tags` / `photo_tags` — system tagów
- `audit_logs` — log zdarzeń systemu
- `refresh_tokens` — tokeny odświeżające (rotacja)

Migracje Flyway: `V001` (tabele) → `V002` (indeksy + FTS trigger) → `V003` (dane seed)
