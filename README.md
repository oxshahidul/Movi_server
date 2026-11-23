# ScreenBox — Full-Stack Entertainment & Streaming Platform

Recreation of the **ScreenBox** entertainment streaming platform (inspired by [screenboxbd.online](https://www.screenboxbd.online/)) built with a modern, responsive **Next.js + TypeScript** frontend, **Node.js + Express** REST API backend, **Prisma ORM**, and **MySQL (managed locally via XAMPP)**.

---

## 🚀 Key Features

- **Cinematic Dark UI**: Dark slate & crimson cinema aesthetic styled with Tailwind CSS, custom responsive aspect ratios (2:3 posters, 16:9 backdrops), and fluid scroll carousels.
- **Bufferless HLS/MP4 Streaming**: Custom Video.js player with HLS (`.m3u8`) streaming, multi-server selection, subtitle support, playback speed, picture-in-picture, and keyboard shortcuts (Space, M, F, Arrow keys).
- **Playback Resume Engine**: Automatically saves playback timestamps to MySQL via heartbeat API every 10 seconds. Prompts or auto-resumes from exact pause points when returning.
- **TV Series & Episode Navigator**: Complete season and episode switcher with thumbnail previews and next-episode transitions.
- **Universal Search**: Real-time debounced search across movies, series, actors, and genres.
- **Personal Library**: Saved Watchlist, Favorites, and Continue Watching shelf.
- **Authentication & RBAC**: Secure JWT auth with HTTP-only cookies, password hashing (`bcryptjs`), and role access controls (`SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`, `USER`).
- **Admin Management Portal**: Administrative metrics dashboard, movie/series CRUD forms, streaming source manager, and user role controls.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + React + TypeScript | Modern client UI and routing |
| **Styling** | Tailwind CSS + Lucide Icons | Responsive cinema dark theme |
| **State Management** | TanStack Query + Zustand | Server-state caching & global player stores |
| **Video Player** | Video.js + HLS Support | Video streaming & playback controls |
| **Backend API** | Node.js + Express.js + TypeScript | REST API with modular MVC architecture |
| **Database** | MySQL (XAMPP for local development) | Normalized relational database on port 3306 |
| **Database ORM** | Prisma ORM | Type-safe migrations, queries, and seeder |
| **Containerization** | Docker & Docker Compose | Multi-container production deployment |

---

## ⚙️ Local Development Quick Start (XAMPP)

### Prerequisites

1. Install **Node.js** (v20+ recommended).
2. Install & Start **XAMPP**:
   - Open XAMPP Control Panel (`D:\Xampp\xampp-control.exe`).
   - Start **MySQL** (Port `3306`) and **Apache** (Port `80`).

### 1. Database Setup

The application uses the default XAMPP MySQL credentials:
- **Host**: `localhost`
- **Port**: `3306`
- **User**: `root`
- **Password**: *(empty)*
- **Database**: `screenbox_db`

To run migrations and seed data:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 2. Run the Application

You can start both frontend and backend concurrently from the root directory:

```bash
# In project root:
npm run dev
```

Or start them individually:

**Backend (Express API on Port 5000):**
```bash
cd backend
npm run dev
```

**Frontend (Next.js on Port 3000):**
```bash
cd frontend
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Super Admin** | `admin@screenbox.com` | `admin123` | Full access, Admin Portal (`/admin`), Movie CRUD |
| **Standard User** | `user@screenbox.com` | `user123` | Streaming, Watchlist, Favorites, Watch History |

---

## 📁 Directory Structure

```text
movi box/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Complete 18-model normalized MySQL schema
│   │   └── seed.ts             # Initial movies, series, episodes & test users
│   ├── src/
│   │   ├── config/             # Environment & port variables
│   │   ├── controllers/        # Auth, Movies, Series, Library, Admin, Search
│   │   ├── middleware/         # JWT auth, error handling, role checks
│   │   ├── routes/             # Express API router definitions
│   │   ├── app.ts              # Express app bootstrap
│   │   └── server.ts           # Server entry point
│   ├── Dockerfile
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Cinema home (Hero, Carousels, Continue Watching)
│   │   │   ├── movies/         # Movies catalog & genre filters
│   │   │   ├── series/         # TV Series catalog & seasons
│   │   │   ├── movie/[slug]/   # Movie detail & backdrop page
│   │   │   ├── series/[slug]/  # Series detail & episode list
│   │   │   ├── watch/          # Video.js player views for Movies & Series
│   │   │   ├── search/         # Live debounced search page
│   │   │   ├── library/        # User Watchlist & Favorites
│   │   │   └── admin/          # Management portal & stats dashboard
│   │   ├── components/         # Navbar, HeroBanner, ContentRow, MovieCard, Player
│   │   ├── store/              # Zustand Auth & Player state stores
│   │   └── types/              # Full TypeScript model definitions
│   ├── Dockerfile
│   └── tailwind.config.ts
│
├── docker-compose.yml          # Production multi-container composition
└── master plan.md              # Project specifications & roadmap
```

---

## 🐳 Production Deployment (Docker Compose)

To spin up the entire production stack (Independent MySQL container + Backend API + Frontend Next.js):

```bash
docker-compose up --build -d
```
