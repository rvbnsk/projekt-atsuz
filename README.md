# The Editorial Archive

**Cyfrowe Archiwum Społecznościowe** — platforma do przechowywania, przeglądania i wyszukiwania historycznych zdjęć, zorganizowanych w hierarchiczną strukturę lokalizacji.

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

## Szybki start (development)

### Wymagania

- **Docker Desktop** 4.x+
- **Java 21** (JDK)
- **Maven 3.9+**
- **Node.js 20+** + **npm**

### 1. Uruchom infrastrukturę (PostgreSQL + MinIO)

```bash
docker compose -f docker-compose.dev.yml up -d
```

Sprawdź status:
- PostgreSQL: `localhost:5432`
- MinIO Console: http://localhost:9001 (login: `minioadmin` / `minioadmin`)

### 2. Skonfiguruj backend

```bash
cd editorial-archive-backend
cp .env.example .env
# Edytuj .env — zmień JWT_SECRET na losowy ciąg min. 32 znaków
```

Uruchom backend (Spring Boot):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
# lub na Windows:
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend startuje na: http://localhost:8080  
Swagger UI: http://localhost:8080/swagger-ui.html

> Flyway automatycznie uruchomi migracje V001–V003 przy pierwszym starcie.  
> Domyślny admin: `admin@editorial-archive.pl` / `Admin@1234`

### 3. Skonfiguruj i uruchom frontend

```bash
cd editorial-archive-frontend
cp .env.example .env
npm install
npm run dev
```

Frontend dostępny na: http://localhost:5173

---

## Struktura projektu

```
projekt-atsuz/
├── editorial-archive-backend/          # Spring Boot
│   ├── src/main/java/pl/editorial/archive/
│   │   ├── config/                     # SecurityConfig, OpenApiConfig
│   │   ├── domain/
│   │   │   ├── user/                   # User, UserRole, AuthService, AuthController
│   │   │   ├── photo/                  # Photo, PhotoStatus, PhotoRepository
│   │   │   ├── hierarchy/              # HierarchyNode, HierarchyRepository
│   │   │   ├── tag/                    # Tag, TagRepository
│   │   │   └── audit/                  # AuditLog, AuditLogRepository
│   │   ├── security/                   # JWT, RefreshToken, Filter
│   │   ├── api/dto/                    # AuthDtos, ApiResponse
│   │   ├── api/exception/              # GlobalExceptionHandler, wyjątki
│   │   └── scheduler/                  # CleanupScheduler
│   ├── src/main/resources/db/migration/
│   │   ├── V001__create_base_tables.sql
│   │   ├── V002__indexes_and_fts.sql
│   │   └── V003__seed_data.sql
│   └── pom.xml
│
├── editorial-archive-frontend/         # React + TypeScript
│   ├── src/
│   │   ├── api/                        # Axios client + endpointy (auth, photos, hierarchy, tags)
│   │   ├── components/
│   │   │   ├── layout/                 # TopAppBar, BottomNav, PageLayout
│   │   │   ├── photo/                  # PhotoCard, PhotoGrid
│   │   │   ├── hierarchy/              # HierarchyTree, HierarchyBreadcrumb
│   │   │   ├── map/                    # ArchiveMap (react-leaflet)
│   │   │   └── ui/                     # Skeleton, ThemeToggle
│   │   ├── hooks/                      # usePhotos, useHierarchy (React Query)
│   │   ├── pages/                      # Strony (Home, Explore, Search, Map, Timeline, Auth, Creator, Admin)
│   │   ├── store/                      # Zustand (auth, theme)
│   │   ├── types/                      # TypeScript types
│   │   └── styles/globals.css          # Design tokens (CSS variables)
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── docker-compose.yml                  # Production (wszystkie serwisy)
├── docker-compose.dev.yml              # Development (tylko DB + MinIO)
└── IMPLEMENTATION_PLAN.md
```

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

## Produkcja (Docker Compose)

```bash
# Skopiuj i uzupełnij zmienne środowiskowe
cp editorial-archive-backend/.env.example .env

# Uruchom wszystko
docker compose up -d

# Logi
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

---

## Co jest zaimplementowane

### Backend ✅
- [x] Struktura projektu Maven (Spring Boot 3.2, Java 21)
- [x] Migracje Flyway (tabele, indeksy, FTS, seed data)
- [x] Encje JPA: User, Photo, HierarchyNode, Tag, AuditLog, RefreshToken
- [x] JWT (access token 15 min + refresh token 7 dni z rotacją)
- [x] Spring Security (CORS, stateless, ochrona endpointów)
- [x] Auth: register, login, refresh, logout, me
- [x] GlobalExceptionHandler + typy wyjątków
- [x] OpenAPI/Swagger konfiguracja
- [x] CleanupScheduler (wygasłe tokeny)
- [x] Dockerfile (multi-stage, JRE 21)
- [x] HierarchyService + HierarchyController (drzewo, breadcrumbs, CRUD)
- [x] PhotoService + PhotoController (CRUD, FTS search, upload, moderacja)
- [x] TagService + TagController (lista, autocomplete, CRUD admin)
- [x] AuditService (zapis zdarzeń w REQUIRES_NEW)
- [x] StorageService: StubStorageService (dev) + S3StorageService (prod, MinIO)
- [x] ImageProcessingService — miniatury 400px + medium 1200px (async, Thumbnailator)
- [x] AdminController — audit log (z filtrami), statystyki systemu
- [x] UserService + UserController — lista, block/unblock, zmiana roli

### Frontend ✅
- [x] Vite + React 18 + TypeScript
- [x] Tailwind CSS + Design tokens (CSS variables, light/dark/contrast)
- [x] React Query + Axios client z JWT interceptorem + auto-refresh
- [x] Zustand stores: auth (persist) + theme (light/dark/contrast, prefers-color-scheme)
- [x] React Router v6 + protected routes + Layout route
- [x] TypeScript types dla wszystkich encji
- [x] API klienty: auth, photos, hierarchy, tags
- [x] React Query hooks: usePhotos, useHierarchy
- [x] Komponenty UI: ThemeToggle, Skeleton, PhotoCard, PhotoGrid
- [x] Komponenty layout: TopAppBar, BottomNav, PageLayout
- [x] Komponenty hierarchii: HierarchyTree (expandable, klawiatura), HierarchyBreadcrumb
- [x] Komponent mapy: ArchiveMap (react-leaflet, markery, popupy z miniaturą)
- [x] Strony publiczne: HomePage (hero + szukaj + siatka), ExplorePage (drzewo + grid), SearchPage (filtry + paginacja), PhotoDetailPage (metadane + powiązane)
- [x] Strony mapy: MapPage (pełnoekranowa mapa + filtry URL), TimelinePage (dekady, drag-to-scroll)
- [x] Auth pages: LoginPage (Zod walidacja), RegisterPage
- [x] Creator pages: DashboardPage (statystyki + ostatnie przesłane), UploadPage (dropzone + formularz), MyCollectionPage (filtry statusu + siatka), EditPhotoPage (edycja + usuwanie)
- [x] Admin pages: AdminDashboardPage (stats), ModerationPage (approve/reject queue), UserManagementPage (block/role), AuditLogPage (event log)
- [x] Dockerfile + nginx (SPA routing, cache, security headers)

- [x] Dostępność WCAG 2.1 AA: poprawki focus-visible, aria-describedby, aria-busy, aria-controls, required, kontrast tokenów CSS

### Infrastruktura ✅
- [x] docker-compose.yml (prod: backend + frontend + db + minio)
- [x] docker-compose.dev.yml (dev: tylko db + minio)
- [x] nginx.conf (SPA, gzip, cache, security headers)

## Co jest do zrobienia (kolejne etapy)

- [ ] Backend: OAuth2 (Google + Facebook)
- [ ] Backend: Testy jednostkowe i integracyjne
- [ ] Frontend: Testy (Vitest + Testing Library + Playwright)
- [ ] DevOps: GitHub Actions CI/CD pipeline

---

*Projekt: The Editorial Archive | Wersja: 1.0.0-SNAPSHOT*
