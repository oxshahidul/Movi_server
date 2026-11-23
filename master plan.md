Understood. We'll update the architecture to use **XAMPP + MySQL instead of PostgreSQL**. For local development, XAMPP will manage MySQL and Apache, while the application can use Node.js for the backend and Next.js for the frontend.

One important clarification: **XAMPP is primarily a local development stack.** You can use its MySQL database during development, but for production, you should run MySQL independently on a properly configured server rather than relying on a desktop-style XAMPP installation.

# Updated Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js + TypeScript | Website UI and routing |
| Styling | Tailwind CSS | Responsive design |
| Animations | Framer Motion | UI animations |
| Backend | Node.js + Express | API and application logic |
| Database | MySQL | Application database |
| Local DB Server | XAMPP | Local MySQL management |
| Database ORM | Prisma | Database queries and schema management |
| Database GUI | phpMyAdmin | Manage MySQL visually |
| Authentication | JWT + HTTP-only cookies | Secure user authentication |
| Cache | Redis (optional) | Performance optimization |
| Video Player | Video.js / Shaka Player | Video playback |
| Web Server | Nginx | Production reverse proxy |
| Containers | Docker | Production deployment |
| CI/CD | GitHub Actions | Automated testing and deployment |
| CDN/WAF | Cloudflare | CDN, DNS, security |
| Monitoring | Prometheus + Grafana | Infrastructure monitoring |
| Error Monitoring | Sentry | Application error tracking |
| Testing | Playwright | Browser testing |

---

# Updated Application Architecture

## Development Environment

```text
                 LOCAL COMPUTER
                 Windows
                     │
         ┌───────────┴────────────┐
         │                        │
         ▼                        ▼
    NEXT.JS FRONTEND         NODE.JS API
      Port 3000               Port 5000
         │                        │
         │                        │
         └───────────┬────────────┘
                     │
                     ▼
              XAMPP MYSQL
                Port 3306
                     │
                     ▼
               PHPMYADMIN
               Port 80/8080
```

### Local Development Services

| Service | Port |
|---|---:|
| Next.js | 3000 |
| Node.js API | 5000 |
| MySQL | 3306 |
| phpMyAdmin | 80 or configured port |

---

# Updated Master Development Prompt

Use this instead of the previous prompt.

# PROJECT: SCREENBOX
## FULL-STACK STREAMING PLATFORM RECREATION

Reference Website:
https://www.screenboxbd.online/

---

# 1. PROJECT OBJECTIVE

Analyze the reference website and rebuild its user experience as a modern, responsive, full-stack entertainment platform.

The application must include:

- Frontend
- Backend
- MySQL database
- Authentication
- Movie management
- TV series management
- Season management
- Episode management
- Search
- Video player
- Watch history
- Favorites
- Watchlist
- Admin dashboard
- API
- Security
- Testing
- DevOps
- Production deployment

Do not create only a static frontend.

Every major component must be functional and properly connected to the backend and database.

Use the reference website to understand the layout, design, navigation, and user experience. Do not copy proprietary source code or unauthorized content.

---

# 2. TECHNOLOGY STACK

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack Query
- Zustand
- React Hook Form
- Zod

## Backend

- Node.js
- Express.js
- TypeScript
- REST API

## Database

- MySQL
- XAMPP for local database development
- phpMyAdmin for database management
- Prisma ORM

## Authentication

- JWT
- HTTP-only cookies
- Secure session handling
- Role-based access control

## Video Player

- Video.js or Shaka Player
- HLS support where authorized
- Subtitle support
- Playback controls
- Resume playback

## DevOps

- Docker
- Docker Compose
- Nginx
- GitHub Actions
- Cloudflare

## Monitoring

- Prometheus
- Grafana
- Sentry

---

# 3. XAMPP DATABASE ENVIRONMENT

Use XAMPP as the local MySQL development environment.

## Local Development Configuration

MySQL:

Host: localhost

Port: 3306

Database: screenbox_db

Username: screenbox_user

Password: Configure through environment variables

phpMyAdmin:

Use phpMyAdmin to inspect and manage the database during development.

Do not hardcode database credentials in the application.

Create:

.env

.env.example

Separate development and production configurations.

Example:

DATABASE_URL="mysql://screenbox_user:YOUR_PASSWORD@localhost:3306/screenbox_db"

Do not commit the actual .env file to Git.

---

# 4. DATABASE ARCHITECTURE

Use MySQL as the primary database.

Use Prisma ORM for database access.

Create a normalized relational schema.

## Required Tables

### Users

- id
- name
- email
- password
- avatar
- role
- status
- created_at
- updated_at

### Roles

- id
- name
- description

### Movies

- id
- title
- slug
- description
- poster
- backdrop
- trailer_url
- release_year
- runtime
- rating
- language
- status
- published_at
- created_at
- updated_at

### Series

- id
- title
- slug
- description
- poster
- backdrop
- trailer_url
- release_year
- rating
- status
- created_at
- updated_at

### Seasons

- id
- series_id
- season_number
- title
- description

### Episodes

- id
- season_id
- title
- slug
- episode_number
- description
- thumbnail
- runtime
- release_date
- status

### Genres

- id
- name
- slug

### MovieGenres

- movie_id
- genre_id

### SeriesGenres

- series_id
- genre_id

### Cast

- id
- name
- image
- biography

### ContentCast

- id
- cast_id
- movie_id
- series_id
- character_name

### VideoSources

- id
- content_type
- content_id
- source_name
- source_url
- quality
- format
- status

### Subtitles

- id
- content_type
- content_id
- language
- subtitle_url
- format

### WatchHistory

- id
- user_id
- content_type
- content_id
- episode_id
- progress_seconds
- duration_seconds
- last_watched_at

### Watchlists

- id
- user_id
- content_type
- content_id
- created_at

### Favorites

- id
- user_id
- content_type
- content_id
- created_at

### Ratings

- id
- user_id
- content_type
- content_id
- rating
- created_at

### UserSettings

- id
- user_id
- autoplay
- preferred_quality
- preferred_language
- subtitle_language

### AuditLogs

- id
- user_id
- action
- entity_type
- entity_id
- details
- created_at

---

# 5. DATABASE RULES

- Use proper primary keys.
- Use foreign keys.
- Use indexes.
- Use unique constraints.
- Prevent duplicate users.
- Prevent duplicate slugs.
- Prevent duplicate watchlist entries.
- Prevent duplicate favorites.
- Use appropriate data types.
- Use transactions when necessary.
- Create database migrations.
- Do not manually modify the production database schema.
- Do not store database credentials in source code.
- Do not store all application data in a single JSON column.
- Do not use unstructured database design.

Prisma must be the primary database access layer.

---

# 6. DATABASE WORKFLOW

Development workflow:

1. Start XAMPP.
2. Start MySQL.
3. Open phpMyAdmin.
4. Create the database.
5. Configure the DATABASE_URL.
6. Run Prisma migrations.
7. Generate Prisma Client.
8. Start the backend.
9. Start the frontend.
10. Verify database connectivity.

Example database:

screenbox_db

Prisma commands:

npx prisma init

npx prisma migrate dev

npx prisma generate

npx prisma studio

Use Prisma Studio as an additional database inspection tool.

phpMyAdmin remains available for direct MySQL administration.

---

# 7. FRONTEND

Analyze the reference website before implementation.

Recreate its design structure and user experience.

Required pages:

- Homepage
- Movies
- Series
- Movie details
- Series details
- Season details
- Episode player
- Search
- Login
- Register
- User profile
- Watchlist
- Favorites
- Watch history

Required UI components:

- Navbar
- Hero banner
- Movie cards
- Series cards
- Content carousel
- Search bar
- Search suggestions
- Category filters
- Genre filters
- Rating badge
- Details modal
- Video player
- Episode list
- Season selector
- Pagination
- Footer
- Loading skeletons
- Empty states
- Error states

Make the website fully responsive.

---

# 8. VIDEO PLAYER

Implement a fully functional video player.

Features:

- Play
- Pause
- Seek
- Volume
- Mute
- Fullscreen
- Playback speed
- Quality selection
- Subtitle selection
- Audio track selection
- Picture-in-picture
- Keyboard shortcuts
- Resume playback
- Continue watching
- Previous episode
- Next episode

Save playback progress in MySQL.

When the user returns, restore their previous playback position.

Use only video sources that you are authorized to stream.

---

# 9. BACKEND API

Build an Express.js REST API.

API structure:

/api/v1/auth

/api/v1/users

/api/v1/movies

/api/v1/series

/api/v1/seasons

/api/v1/episodes

/api/v1/genres

/api/v1/search

/api/v1/watch-history

/api/v1/watchlist

/api/v1/favorites

/api/v1/ratings

/api/v1/admin

Implement:

- Input validation
- Error handling
- Authentication
- Authorization
- Rate limiting
- Pagination
- Logging
- API versioning

---

# 10. AUTHENTICATION

Implement:

- Registration
- Login
- Logout
- Password reset
- Profile update
- Email verification
- Session handling

Roles:

- Super Admin
- Admin
- Content Manager
- Moderator
- User

Use secure password hashing.

Use HTTP-only cookies where appropriate.

Never expose passwords or authentication tokens in frontend code.

---

# 11. ADMIN PANEL

Create a complete admin panel.

Dashboard:

- Total movies
- Total series
- Total episodes
- Total users
- Total views
- Popular content
- Recent activity

Content Management:

- Create movie
- Edit movie
- Delete movie
- Publish movie
- Create series
- Create seasons
- Create episodes
- Manage video sources
- Manage subtitles
- Manage genres
- Manage cast
- Upload posters
- Upload thumbnails
- Upload backdrops

User Management:

- View users
- Search users
- Edit user
- Change role
- Suspend account
- Activate account

All administrative actions must be authenticated and authorized.

---

# 12. SECURITY

Implement:

- Secure authentication
- Role-based permissions
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection where applicable
- Secure cookies
- Password hashing
- API access controls
- File upload restrictions
- Security headers
- Audit logging

Do not expose MySQL publicly.

The frontend must never directly connect to MySQL.

All database communication must go through the backend.

---

# 13. DEVELOPMENT ENVIRONMENT

Use the following local services:

Frontend:

Next.js

Port:

3000

Backend:

Node.js + Express

Port:

5000

Database:

XAMPP MySQL

Port:

3306

Database Management:

phpMyAdmin

Redis:

Optional local service

---

# 14. PROJECT STRUCTURE

Use a maintainable structure.

Example:

screenbox/

├── frontend/

│   ├── app/

│   ├── components/

│   ├── features/

│   ├── hooks/

│   ├── services/

│   ├── lib/

│   ├── types/

│   └── styles/

│

├── backend/

│   ├── src/

│   │   ├── modules/

│   │   ├── middleware/

│   │   ├── routes/

│   │   ├── services/

│   │   ├── controllers/

│   │   ├── validators/

│   │   ├── utils/

│   │   └── config/

│   │

│   ├── prisma/

│   │   └── schema.prisma

│   └── tests/

│

├── infrastructure/

│   ├── nginx/

│   ├── docker/

│   ├── monitoring/

│   └── backup/

│

├── docs/

│   ├── architecture.md

│   ├── database.md

│   ├── api.md

│   ├── deployment.md

│   └── security.md

│

├── .env.example

├── .gitignore

└── README.md

Adjust the structure when needed, but maintain clear separation of responsibilities.

---

# 15. DEVOPS

Production deployment must not depend on XAMPP.

XAMPP is only the local development database environment.

Production:

- Linux server
- MySQL server
- Docker
- Docker Compose
- Nginx
- HTTPS
- Cloudflare

The production database must be configured independently of the local XAMPP installation.

Use Docker for production deployment.

---

# 16. CI/CD

GitHub Actions pipeline:

1. Checkout source code
2. Install dependencies
3. Lint
4. Type checking
5. Run tests
6. Build frontend
7. Build backend
8. Build Docker images
9. Scan dependencies
10. Deploy to staging
11. Run health checks
12. Deploy production after approval

Do not deploy broken builds.

Implement rollback procedures.

---

# 17. MONITORING

Monitor:

- CPU
- RAM
- Disk
- Network
- Database
- API
- Application errors
- Container health

Tools:

- Prometheus
- Grafana
- Sentry

Create alerts for critical infrastructure failures.

---

# 18. BACKUP

Implement:

- Automated MySQL backups
- Daily backups
- Retention policies
- Off-site backup
- Backup verification
- Restore testing

Document database recovery procedures.

Never assume a backup is valid without testing a restore.

---

# 19. TESTING

Unit testing.

API integration testing.

Database testing.

Authentication testing.

Admin testing.

Frontend testing.

Playwright end-to-end testing.

Responsive testing.

Test every critical workflow.

---

# 20. DEVELOPMENT WORKFLOW

Build the application in phases.

Phase 1:

Website analysis.

Phase 2:

UI/UX and design system.

Phase 3:

Frontend pages.

Phase 4:

MySQL database schema and Prisma.

Phase 5:

Backend APIs.

Phase 6:

Authentication.

Phase 7:

Video player.

Phase 8:

Admin panel.

Phase 9:

Frontend/backend integration.

Phase 10:

Testing.

Phase 11:

Security audit.

Phase 12:

DevOps.

Phase 13:

Production deployment.

Do not attempt to implement all phases simultaneously.

After each phase:

- Test the implementation.
- Fix errors.
- Verify functionality.
- Update documentation.
- Proceed to the next phase.

---

# FINAL REQUIREMENT

Build a real, functional application.

Do not create a static mockup.

Do not fake functionality.

Do not leave disconnected buttons.

Do not use fake backend responses in production.

Do not ignore security.

Do not skip database migrations.

Do not skip testing.

Do not declare the project complete until all core features are tested and working.

---

# 3. XAMPP Database Setup

### Step 1 — Start XAMPP

Start:

- Apache (optional, if using phpMyAdmin)
- MySQL

### Step 2 — Open phpMyAdmin

Open:

`http://localhost/phpmyadmin`

### Step 3 — Create Database

Create:

```sql
CREATE DATABASE screenbox_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Step 4 — Create Database User

For development, you can configure a dedicated user instead of using root.

```sql
CREATE USER 'screenbox_user'@'localhost'
IDENTIFIED BY 'ChangeThisPassword';

GRANT ALL PRIVILEGES ON screenbox_db.*
TO 'screenbox_user'@'localhost';

FLUSH PRIVILEGES;
```

### Step 5 — Backend `.env`

```env
PORT=5000
NODE_ENV=development

DATABASE_URL="mysql://screenbox_user:ChangeThisPassword@localhost:3306/screenbox_db"

JWT_SECRET=change_to_a_long_random_secret
```

---

# 4. Production Architecture

When your website is ready to go live:

```text
                 INTERNET
                    │
                    ▼
               CLOUDFLARE
            DNS / WAF / CDN
                    │
                    ▼
              UBUNTU SERVER
                    │
                    ▼
                 NGINX
                    │
          ┌─────────┴──────────┐
          │                    │
          ▼                    ▼
      FRONTEND              BACKEND
      Next.js              Node.js
          │                    │
          └─────────┬──────────┘
                    │
                    ▼
                  MYSQL
                    │
                    ▼
              BACKUP SYSTEM
```

### Development vs Production

| | Development | Production |
|---|---|---|
| Database | XAMPP MySQL | Standalone MySQL / managed MySQL |
| Database GUI | phpMyAdmin | Adminer or restricted phpMyAdmin |
| Frontend | Local Next.js | Production deployment |
| Backend | Local Node.js | Production Node.js |
| Reverse Proxy | Optional | Nginx |
| SSL | Optional local | Mandatory HTTPS |
| Deployment | Manual development | CI/CD |
| Monitoring | Console | Monitoring stack |
| Backup | Manual | Automated |

---

## 5. Important Recommendation

Since you're using **AI-assisted development**, don't allow your AI agent to change the database structure randomly during development.

Maintain these files:

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
```

Whenever the database changes:

```bash
npx prisma migrate dev --name add_feature
```

Don't simply delete the database and recreate it whenever an error occurs. That approach can destroy data and conceal migration problems.

**Recommended final stack: Next.js + TypeScript + Express + MySQL (XAMPP for local development) + Prisma + Docker + Nginx.**

If you want, I can next give you a **separate ultra-detailed AI coding prompt specifically for recreating ScreenBoxBD's UI page-by-page, including homepage, movie details, series/episode layout, and video-player UI**.