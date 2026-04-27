# 🎓 Learnexa — SSB International School

> Chapter-wise K-10 learning platform. KSEEB & CBSE boards.

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + SCSS Tokens |
| State | Zustand |
| Routing | React Router v7 |
| Icons | Lucide React |
| Validation | Zod |
| Backend | FastAPI (Python) |
| Database | PostgreSQL 16 (Docker) |
| Auth | JWT (python-jose + passlib/bcrypt) |

## Quick Start

### 1. Start PostgreSQL (Docker)
```bash
docker compose up -d
```
This starts PostgreSQL on port **5433** with:
- User: `learnexa` | Password: `learnexa123` | DB: `learnexa_db`

### 2. Start Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Tables auto-created on startup

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
- App: http://localhost:8080

## Test Accounts (Pre-seeded)

| Role | Email | Password |
|:-----|:------|:---------|
| Admin | admin@ssb.edu | admin123 |
| Teacher | teacher@ssb.edu | teacher123 |
| Student | student@ssb.edu | student123 |
| Parent | parent@ssb.edu | parent123 |

## Project Structure
```
SSB School/
├── docker-compose.yml         # PostgreSQL container
├── frontend/                  # React 19 + TypeScript
│   ├── .env                   # VITE_APP_NAME, VITE_API_BASE_URL
│   ├── src/
│   │   ├── style/
│   │   │   └── token.scss     # Learnexa design tokens
│   │   ├── types/index.ts     # 15+ TypeScript interfaces
│   │   ├── lib/
│   │   │   ├── constants.ts   # School config, boards, subjects
│   │   │   ├── classConfig.ts # Class 1–10 subject config (semantic tokens)
│   │   │   ├── validation.ts  # Zod schemas for forms
│   │   │   ├── useDocTitle.ts # Per-page document title hook
│   │   │   └── mockData/      # Centralized mock data modules
│   │   ├── services/api.ts    # Typed API client with error handling
│   │   ├── store/authStore.ts # Zustand auth (real JWT flow)
│   │   ├── components/
│   │   │   ├── ui/            # Button, Input, Modal, Skeleton, etc.
│   │   │   ├── layout/        # DashboardLayout (sidebar + topbar)
│   │   │   └── shared/        # CurriculumTree, StatCard, PageHeader
│   │   └── pages/
│   │       ├── public/        # Landing, Login, Register
│   │       │   └── landing/   # Decomposed: Nav, Hero, Sections
│   │       ├── admin/         # Dashboard, Classes, Subjects, Teachers,
│   │       │                  # Content, Settings + UploadModal
│   │       ├── teacher/       # Dashboard, Upload, Library, QuestionBank,
│   │       │                  # CreateTest, Tests, Announcements
│   │       ├── student/       # Dashboard, Subjects, Tests, Progress
│   │       └── parent/        # Dashboard, Progress, Results, Notifications
│   └── index.html
├── backend/                   # FastAPI + PostgreSQL
│   ├── .env                   # DB URL + JWT secret
│   ├── .env.example           # Template for environment setup
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # FastAPI app + env-driven CORS + routes
│       ├── core/
│       │   ├── config.py      # Env config loader
│       │   └── security.py    # JWT + bcrypt + get_current_user
│       ├── db/database.py     # SQLAlchemy engine + session
│       ├── models/models.py   # User, Subject, Chapter, Content, Question,
│       │                      # Test, TestAttempt, Notification
│       ├── schemas/schemas.py # Pydantic request/response models
│       └── api/auth.py        # /register, /login, /me endpoints
└── README.md
```

## Architecture

- **Semantic design tokens** — All colors via SCSS tokens (`src/style/token.scss`)
- **No hardcoded strings** — School name, boards from `constants.ts`
- **Centralized mock data** — All inline data extracted to `lib/mockData/`
- **Zod form validation** — Login & Register with field-level errors
- **Per-page SEO titles** — `useDocTitle` hook on all 21 pages
- **Real JWT auth** — Register → Login → JWT → Protected routes → /me
- **Role-based routing** — ProtectedRoute wrapper checks user role
- **PostgreSQL** — Docker container, auto table creation
- **30+ pages** — All functional with responsive layouts
- **Loading skeletons** — Reusable Skeleton, DashboardSkeleton, TableSkeleton
