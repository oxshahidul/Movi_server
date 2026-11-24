# NexFlix — Full-Stack Entertainment & Streaming Platform

**NexFlix** is a high-performance cinema entertainment streaming platform inspired by modern streaming portals like [iScreen.com.bd] and BDIX cinema hubs. Built with a responsive **Next.js 14 + TypeScript** frontend, **Node.js + Express** REST API backend, **Prisma ORM**, and **MySQL (managed locally via XAMPP)**.

---

## 🚀 Key Features

- **iScreen-Inspired Modern UI**: Dark slate & crimson cinema aesthetic styled with Tailwind CSS, custom responsive aspect ratios (2:3 posters, 16:9 backdrops), and fluid scroll carousels.
- **Top 10 in Bangladesh**: High-visibility ranked carousel featuring oversized outlined rank typography (`1` to `10`) overlapping poster cards.
- **Bufferless HLS/MP4 & Live TV**: Dual streaming engines with custom Video.js and `hls.js` low-latency tuning, multi-server selection, subtitle support, playback speed, picture-in-picture, and keyboard shortcuts.
- **Playback Resume Engine**: Automatically saves playback timestamps to MySQL via heartbeat API every 10 seconds. Prompts or auto-resumes from exact pause points when returning.
- **TV Series & Horizontal Episode Carousel**: Complete season and episode switcher with mousewheel-scrollable horizontal thumbnail carousel and next-episode transitions.
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
| **Video Players** | Video.js + hls.js | On-demand cinema video and low-latency Live TV streaming |
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
| **Super Admin** | `admin@nexflix.com` | `admin123` | Full access, Admin Portal (`/admin`), Content CRUD |
| **Standard User** | `user@nexflix.com` | `user123` | Streaming, Watchlist, Favorites, Watch History |

---

## 📁 Directory Structure

```text
nexflix/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Complete 18-model normalized MySQL schema
│   │   └── seed.ts             # Initial movies, series, episodes & test users
│   ├── src/
│   │   ├── config/             # Environment & port variables
│   │   ├── controllers/        # Auth, Movies, Series, Live TV, Admin, Search
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
│   │   │   ├── page.tsx        # Cinema home (Hero, Top 10, Carousels, Continue Watching)
│   │   │   ├── movies/         # Movies catalog & genre filters
│   │   │   ├── series/         # TV Series catalog & seasons
│   │   │   ├── live/           # Low-Latency Live TV Studio
│   │   │   ├── movie/[slug]/   # Movie detail & backdrop page
│   │   │   ├── series/[slug]/  # Series detail & episode list
│   │   │   ├── watch/          # Video player views with episode carousel
│   │   │   ├── search/         # Live debounced search page
│   │   │   ├── library/        # User Watchlist & Favorites
│   │   │   └── admin/          # Management portal & stats dashboard
│   │   ├── components/         # NexFlixLogo, HeroBanner, TopTenRow, ContentRow, Players
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
