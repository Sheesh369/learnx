# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Development Commands

### Infrastructure
```bash
docker compose up -d          # Start PostgreSQL (port 5433) + fake-GCS (port 4443)
```

### Backend
```bash
cd backend
source myenv/Scripts/activate  # Windows venv (bash); on Linux: source myenv/bin/activate
pip install -r requirements.txt
alembic upgrade head           # Apply all DB migrations
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev      # Dev server on port 8080
npm run build    # tsc + vite build
npm run lint     # ESLint
```

### Alembic (DB migrations)
```bash
cd backend
alembic upgrade head                     # Apply pending migrations
alembic downgrade -1                     # Roll back one revision
alembic revision -m "describe_change"    # Create a new empty migration
```
Never use `Base.metadata.create_all()` — all schema changes go through Alembic.

---

## Architecture Overview

### Data Flow
```
Admin uploads PDF → POST /api/admin/books/upload/{chapter_id} → stored in GCS
Admin triggers AI → POST /api/admin/books/{chapter_id}/process
                 → BackgroundTask → agent/runner.py
                 → ADK LlmAgent (Gemini) + google_search + generate_image (Imagen)
                 → Saves ChapterContent rows + GlossaryEntry rows to DB
```

### DB Hierarchy
```
grades → subjects → chapters → chapter_contents
                             → glossary_entries
users (parent_id FK → self for parent-child links)
questions → test_questions → tests → test_attempts
```

### Backend Structure (`backend/app/`)

| Path | Purpose |
|------|---------|
| `core/config.py` | All env vars: `DATABASE_URL`, `SECRET_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `IMAGEN_MODEL`, `GCS_BUCKET_NAME` |
| `core/security.py` | `hash_password`/`verify_password` (bcrypt direct, **not** passlib), `create_access_token`, `get_current_user` |
| `core/deps.py` | FastAPI dependency injectors: `get_db`, `get_current_user`, `require_admin` |
| `core/gcs.py` | `upload_bytes`, `upload_file`, `delete_blob` — wraps `google-cloud-storage` |
| `db/database.py` | SQLAlchemy engine + `SessionLocal` + `get_db` |
| `models/` | One file per entity; `__init__.py` re-exports everything |
| `schemas/` | One Pydantic file per domain; `__init__.py` re-exports everything |
| `services/` | `user_service`, `excel_service`, `glossary_service`, `content_service` |
| `api/auth.py` | `POST /api/auth/login`, `GET /api/auth/me` — **no register endpoint** |
| `api/admin/grades.py` | Grade + Subject CRUD |
| `api/admin/users.py` | Excel upload for students/teachers, user list |
| `api/admin/books.py` | PDF upload + agent trigger |
| `api/content.py` | Full CRUD on `chapter_contents` |
| `api/glossary.py` | Glossary CRUD with 3-scope fetch |
| `agent/agent.py` | ADK `LlmAgent` definition (`book_simplifier_agent`) |
| `agent/runner.py` | `process_chapter_async()` — runs agent, saves output to DB |
| `agent/tools/image_gen_tool.py` | Imagen via `google-genai` SDK → uploads to GCS |

**Important**: `passlib` has a bcrypt compatibility bug in this environment. Use `import bcrypt` directly for all password hashing — never `CryptContext`.

### Frontend Structure (`frontend/src/`)

| Path | Purpose |
|------|---------|
| `types/index.ts` | All TypeScript interfaces (`User`, `Subject`, `Chapter`, `Content`, `Question`, `Test`, etc.) |
| `lib/constants.ts` | `APP_NAME`, `SCHOOL_NAME`, `DASHBOARD_PATHS`, `SUPPORTED_BOARDS`, subject templates |
| `lib/classConfig.ts` | Per-class subject configuration with semantic color tokens |
| `lib/validation.ts` | Zod schemas; `validateForm()` returns field-level error map |
| `lib/mockData/` | All placeholder data — one file per page domain |
| `services/api.ts` | `apiFetch<T>()` with auto-auth header; `api.auth.{login,me}` |
| `store/authStore.ts` | Zustand store: `login`, `logout`, `loadUser`, `getDashboardPath` |
| `components/ui/` | Design system: Button, Input, Modal, Select, Badge, Skeleton, Spinner, Toast, FileUpload |
| `components/layout/` | `DashboardLayout` (wraps all auth pages), `Sidebar`, `Topbar` |
| `pages/public/` | `LandingPage`, `LoginPage` only — **no register page is routed** |
| `pages/admin/` | Dashboard, ClassManagement, ClassSubjects, SubjectChapters, ChapterContent, TeacherManagement, SchoolSettings, UploadModal |
| `pages/teacher/` | TeacherDashboard, Announcements |
| `pages/student/` | StudentDashboard, StudentSubjects, StudentTests, ProgressTracker |
| `pages/parent/` | ParentDashboard, ChildProgress, ParentTestResults, ParentNotifications |
| `pages/shared/` | QuestionBank |

**Path alias**: `@/` maps to `src/` (configured in `vite.config.ts`).

**Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin) + SCSS design tokens in `src/style/token.scss`. All colors use token variables.

### Auth Flow
1. `POST /api/auth/login` → JWT stored in `localStorage` as `learnexa_token`
2. All API calls include `Authorization: Bearer <token>` via `apiFetch`
3. `App.tsx` calls `loadUser()` on mount → `GET /api/auth/me` to restore session
4. `ProtectedRoute` checks `isAuthenticated` + role, redirects to role-specific dashboard

### User Creation
No public signup. Users are created only by admin via:
- Excel upload (`POST /api/admin/upload/students` or `/teachers`)
- Auto-generated password: `firstname + last4digits_of_phone` (or 4 random digits)

### Glossary Scoping
`GET /api/glossary/chapter/{chapter_id}` returns entries from 3 scopes (priority order):
1. Chapter-level (`chapter_id` matches)
2. Subject-level (`subject_id` matches, `chapter_id` is NULL)
3. Global (both NULL)

Frontend deduplicates by word and highlights matches in `text_content` with hover cards.

### GCS (Local Dev)
`docker compose up -d` starts `fake-gcs-server` on port 4443. The `STORAGE_EMULATOR_HOST` env var points the GCS client to it. Bucket name: `learnexa-bucket`.

### Agent (.env requirements)
```
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.0-flash
IMAGEN_MODEL=imagen-3.0-generate-002
GOOGLE_GENAI_USE_VERTEXAI=FALSE
```

---

## Key Constraints

- **10 DB tables** (no more): users, grades, subjects, chapters, chapter_contents, glossary_entries, questions, tests, test_questions, test_attempts
- `ContentType` enum values: `simplified_text | image | video_youtube | pdf | note`
- `UserRole` enum values: `school_admin | teacher | student | parent`
- Frontend runs on **port 8080**, backend on **port 8000**, DB on **port 5433**
- Admin seed: `admin@ssb.edu` / `admin123`
