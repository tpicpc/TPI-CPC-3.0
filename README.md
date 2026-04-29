# TPI CPC — Unified Next.js App (v3.0)

> **Version 3.0** — Full unified rewrite. Public site + member dashboard + admin panel + REST API all in one Next.js 15 app.

A single Next.js 15 application that serves the **public website**, the **member dashboard**, the **admin panel**, and the **REST API**. Built to deploy free on Vercel + MongoDB Atlas + ImgBB.

> Computer & Programming Club — Thakurgaon Polytechnic Institute

[![Version](https://img.shields.io/badge/version-3.0-6366f1)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000)](https://vercel.com)

---

## Tech stack

- **Next.js 15.5** (App Router) + **React 19**
- **Tailwind CSS 3** + Radix UI primitives + Lucide icons + Framer Motion
- **MongoDB** with Mongoose 8 (Vercel-tuned cached connection)
- **JWT** auth (separate user and admin sessions, 7-day expiry)
- **ImgBB** for free unlimited image hosting
- **Nodemailer** (Gmail SMTP) for OTP, verification, and enrollment emails
- **react-quill-new** for the rich text editor
- **embla-carousel** + **react-countup** for landing-page polish

---

## Quick start

> Requires **Node.js 20+** (enforced via `package.json` `engines`) and a running MongoDB instance (local or Atlas).

```bash
# 1. Clone and enter the project
git clone https://github.com/<you>/tpi-cpc-web.git
cd tpi-cpc-web/web

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# → open .env.local and fill in MONGODB_URI, JWT_SECRET, IMGBB_API_KEY,
#   EMAIL_USER, EMAIL_PASS, NEXT_PUBLIC_APP_URL, ADMIN_SEED_*

# 4. Seed the first admin (creates one record from ADMIN_SEED_* vars)
npm run seed

# 5. Start the dev server
npm run dev
```

Then visit:

| URL | What it is |
|---|---|
| http://localhost:3000 | Public site |
| http://localhost:3000/login | Member login |
| http://localhost:3000/signup | New member signup (4-digit email verification) |
| http://localhost:3000/dashboard | Member dashboard (after login) |
| http://localhost:3000/admin/login | Admin panel — sign in with the seeded admin |

**Default seeded admin** (from `.env.local.example`):

- Email: `admin@tpicpc.com`
- Password: `admin123` *(change this immediately from `/admin/profile` after first login)*

**Optional:** to populate the database with the live tpicpc.com content (advisors, teams across 2025/2024/2023, events, blogs, reviews):

```bash
npm run import:live
```

> ⚠️ `import:live` runs `deleteMany({})` on each collection first — only use it on a fresh database.

---

## Environment variables

| Key | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection (local for dev, Atlas SRV for prod) |
| `JWT_SECRET` | Random string for signing JWTs (use `openssl rand -hex 32`) |
| `IMGBB_API_KEY` | Free key from https://api.imgbb.com/ |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address + App Password (for OTP / verify / enrollment emails) |
| `NEXT_PUBLIC_APP_URL` | Site URL — used by sitemap, robots, email templates |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` / `ADMIN_SEED_NAME` | Used by `npm run seed` |

If `EMAIL_*` vars are unset, OTPs are logged to the server console (fine for dev).

---

## Folder structure

```
app/
  (public)/        Public pages: home, about, teams, events, workshop, projects, forum, resources, blogs, leaderboard, members, contact, faqs, testimonials, add-review, submit-blog, submit-project
  (auth)/          Login / signup / forgot-password / verify-email
  dashboard/       Logged-in member dashboard (sidebar layout)
  admin/           Admin dashboard (sidebar layout)
  api/v1/          Backend API route handlers
  certificate/     Public printable certificate page
  profile/         Legacy redirect for old /profile links
  layout.jsx       Root layout + Outfit font + metadata
  providers.jsx    Theme · User · HomeData · Tooltip + Toaster
  sitemap.js       Dynamic sitemap with blogs + workshops
  robots.js        Robots.txt with /admin /api /profile disallowed
components/
  ui/              Button, Card, Input, Skeleton, Select, Tooltip, Dialog, Accordion, Label
  admin/           Admin-only widgets (Sidebar, Topbar, PageHeader, ConfirmDialog, RichTextEditor, LessonsManager)
  dashboard/       Member dashboard sidebar
  skeletons.jsx    Reusable shimmer loading skeletons
  Navbar / Footer / NoticeBar / Hero / Counter / WhyJoin / SectionTitle / TeamMember / AdvisorCard / FlipWords / AboutSection / ContactSection / HomeFAQs / EventCard
contexts/          Theme · User · Admin · HomeData providers
lib/
  db.js            Cached Mongoose connection (Vercel-tuned)
  auth.js          JWT helpers + Bearer/cookie extraction + requireActiveUser
  imgbb.js         Image upload helper
  mailer.js        Nodemailer + email templates (verify, OTP, enrollment)
  youtube.js       YouTube URL/playlist parser
  validators.js    isValidEmail, isValidUsername, slugifyUsername, password strength
  avatars.js       getDefaultAvatar(gender), guessGender(name)
  utils.js         cn, formatDate, formatDateTime, sortMembers, rankPosition
  api-client.js    adminApi() / userApi() (axios with auth)
  api-response.js  ok / fail / serverError helpers
  assets.js        Nav links, counter numbers, why-join cards, FAQ data
models/            User · Admin · Team (year-based + gender) · Advisor · Event · Workshop (LMS) ·
                   Blog (with status) · Review · Notice · Leaderboard · Project · Question · Resource ·
                   Certificate · Enrollment
public/            Logo, default avatars (male / female / neutral), favicon
scripts/           seed-admin.mjs · import-from-live.mjs · backfill-blog-status.mjs
```

---

## Features

### Public site

- **Animated notice bar** (admin-managed, dismissable, persisted per visitor)
- **Year-based teams** — current year on `/teams`, prior years auto-archive as Ex Team groups
- **Position-aware ordering** — President always first, then VP, GS, etc.
- **Round member avatars** with gradient ring + social hover icons
- **Squircle premium advisor cards** — auto color-coded by tier (Senior / Junior / Co-Advisor)
- **Default gender-based avatars** (male / female / neutral SVGs) when no photo uploaded
- **Events** with status filter (Upcoming / Ongoing / Completed)
- **Workshops = full LMS** — multi-lesson YouTube courses, playlist embeds, autoplay-next, watched tracking, **enrollment gate** (must verify email + click Enroll), **Coming Soon** preview cards with release dates
- **Project Showcase** — members upload demos, GitHub links, screenshots, with **likes + comments** (admin moderates)
- **Discussion Forum** (Q&A) — StackOverflow-style: questions, upvotes, accepted answers, tag-based filtering
- **Resource Library** — admin-curated downloads (Notes, Cheat Sheets, E-books, Tutorials) with download counter and category filter
- **Blogs** — rich text content, **user-submitted with admin approval workflow**
- **Member testimonials** — submit + auto-display
- **Member profile pages** at `/members/<username>` (or ObjectId fallback) — stats, projects, blogs, enrolled courses
- **Leaderboard** — two tabs: yearly (admin-curated) + by courses (auto-computed from enrollments)
- **SEO** — dynamic `sitemap.xml`, `robots.txt`, OpenGraph metadata
- **Dark mode** with system preference detection + persisted to localStorage
- **Loading skeletons** with shimmer animation on every async page

### Auth

- Signup with **two-step polished form** (about you → academic & security)
- **4-digit email verification** required before enrollment / posting / commenting (auto-resend with 60s cooldown)
- **Unique auto-generated username** (slugified from full name) — editable later in dashboard with **real-time availability check**
- Login with verified-redirect flow + suspended/banned account handling
- Forgot password (6-digit OTP via email, 10-minute expiry)
- Atlas-tuned Mongoose connection that survives Vercel cold starts
- Bearer-token auth via `Authorization` header (token stored in `localStorage`)

### Member dashboard (`/dashboard`)

- **Welcome banner** with name + username + verification CTA
- **Stat tiles** (clickable): Enrolled courses · Certificates · Projects · Blogs
- **Quick actions** — Find course / Submit project / Write blog / Ask question
- **Activity breakdown** by status (approved / pending / rejected, plus total likes)
- Sub-pages: Profile · Enrollments · Certificates · Projects · Blogs · Questions
- **Earned certificates** with print/save-as-PDF view at `/certificate/<number>`

### Admin dashboard (`/admin`)

- Separate login with forgot-password flow
- Live stat cards (Members, Teams, Advisors, Events, Workshops, Blogs, Projects, Reviews, Notices, Leaderboard)
- Full CRUD:
  - **Members** — search, verified filter, view detail with enrollments, suspend/ban with reason
  - **Teams** (year-based, gender, position presets, social URLs)
  - **Advisors** (tier-aware)
  - **Events** (status, datetime pickers)
  - **Workshops/LMS** (multi-lesson YouTube editor, drag-reorder, resources, Coming Soon, release date)
  - **Blogs** with **pending review queue** (approve / reject)
  - **Projects** with **pending review queue** + featured toggle
  - **Forum** moderation (delete questions / answers)
  - **Resources** (upload by URL — Drive / Dropbox / etc, dynamic categories)
  - **Certificates** (issue for course completion or event participation)
  - **Notice Bar** (active toggle, priority, expiry, link)
  - **Reviews** (delete spam)
  - **Leaderboard** (yearly entries with badges)

---

## API surface

All API routes live under `/api/v1/*` and follow a consistent `{ success, message, ... }` response shape (see `lib/api-response.js`).

| Group | Routes |
|---|---|
| Auth (user) | `signup` · `login` · `verify-email` · `resend-verify-otp` · `send-reset-otp` · `verify-reset-otp` · `change-password` · `update` · `data` · `check-username` |
| Auth (admin) | `login` · `send-reset-otp` · `change-password` · `profile` · `update-profile` · `stats` · `users[/id]` |
| Content (public read) | `home-page/data` · `team[/list]` · `advisor` · `event[/list]` · `notice[/list]` · `workshop[/list]` · `workshop/[slug]` · `blog[/list]` · `review[/list]` · `resources` · `leaderboard[/list]` · `members/[handle]` |
| Content (auth-write) | `blog/submit` · `project/submit` · `review` · `workshop/[slug]/enroll` · `questions[/answer/vote]` · `resources/[id]/download` |
| Member dashboard | `me/stats` · `me/blogs` · `me/projects` · `me/enrollments` · `me/questions` · `certificates/my` |
| Moderation | `blog/[id]/moderate` · `project/[id]/moderate` · `project/[id]/comment[/id]` · `project/[id]/like` |
| Certificates | `certificates` · `certificates/verify/[number]` |
| Misc | `upload` (ImgBB proxy) |

---

## Version history

**v3.0 (current)** — Full unified rewrite. Public site + member dashboard + admin panel + REST API merged into one Next.js 15 app. All 8 phases below shipped.

- [x] **Phase 1** — Scaffold, public pages, models, read-only API
- [x] **Phase 2** — Auth (user + admin), full API write routes, ImgBB upload
- [x] **Phase 3** — Admin panel for original entities
- [x] **Phase 4** — Workshops/LMS, Notice bar, Leaderboard, year-based teams
- [x] **Phase 5** — Auth UX polish, admin reset, SEO, deployment config
- [x] **Phase 6** — Live data import, original site styling, dark/light mode, mobile navbar
- [x] **Phase 7** — Course enrollment + welcome emails + email verification
- [x] **Phase 8** — Project showcase, member profiles, username system, Forum, Resource Library, Certificates, Member dashboard, loading skeletons, Vercel hardening

Earlier versions (v1.x / v2.x) were split across separate React frontend and Express backend repos — replaced wholesale by this unified codebase.

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server (`http://localhost:3000`) |
| `npm run build` | Production build (107 pages) |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run seed` | Create the first admin from `ADMIN_SEED_*` env vars |
| `npm run import:live` | Scrape `https://api.tpicpc.com` + `https://tpicpc.vercel.app` to populate Atlas with advisors, multi-year teams, events, blogs, reviews |

The `scripts/backfill-blog-status.mjs` helper migrates legacy blogs missing a `status` field — run with `node scripts/backfill-blog-status.mjs` if `/blogs` is empty after migration.

---

## Testing checklist

After running locally with seeded admin:

**Public site**

- [ ] Home loads, notice bar scrolls, About TPI CPC video plays
- [ ] Dark / light toggle persists on reload
- [ ] `/teams` — year groupings, President first, round avatars
- [ ] `/events` — status filter + skeleton while loading
- [ ] `/workshop` — Available Now + Coming Soon sections; locked preview if not enrolled
- [ ] `/projects` — gallery → detail with screenshots, likes, comments
- [ ] `/forum` — Newest / Top / Unanswered; ask, vote, accept answer
- [ ] `/resources` — categories, click downloads (counter increments)
- [ ] `/leaderboard` — Yearly / By Courses tabs
- [ ] `/blogs` — published only; full HTML article on click
- [ ] `/members/<username>` shows stats + content
- [ ] `/sitemap.xml` and `/robots.txt`

**Auth**

- [ ] Signup two-step → 4-digit email OTP → verify → land on `/dashboard`
- [ ] Login: unverified user → `/verify-email`; verified → `/dashboard`
- [ ] `/forgot-password` 6-digit OTP flow
- [ ] Username editable on `/dashboard/profile` with real-time availability check
- [ ] Suspended / banned users get a clear message on login

**Member dashboard**

- [ ] Stat tiles + quick actions
- [ ] `/submit-project` → admin approves → appears on `/projects`
- [ ] `/submit-blog` → admin approves → appears on `/blogs`
- [ ] Enroll in workshop → confirmation email → full content unlocks
- [ ] Admin issues certificate → user sees it under `/dashboard/certificates`

**Admin**

- [ ] `/admin/login` + `/admin/forgot-password`
- [ ] Add team member with year → correct grouping
- [ ] Create notice → marquee shows on public site
- [ ] Create workshop with 2 YouTube URLs → enrolled user gets autoplay-next
- [ ] Issue certificate → printable at `/certificate/<number>`
- [ ] Resource upload by URL → public download counter

---

## Vercel-specific notes

- **Cold-start tuned** — `lib/db.js` uses a small connection pool (`maxPoolSize: 5, minPoolSize: 0`), `bufferCommands: true`, and clears the cached promise on failure so the next request retries instead of failing forever.
- **Function duration** — capped at **10s** in `vercel.json` (free Hobby tier limit).
- **Region** — pinned to `sin1` (Singapore) — closest to South Asia. Change in `vercel.json` if you need elsewhere.
- **Body size** — Hobby tier caps requests at 4.5 MB. Image uploads are capped to **4 MB** client-side (see `signup/page.jsx`).
- **Image domains** — `next.config.mjs` allows ImgBB, Cloudinary, YouTube thumbnail hosts, and the production domain.
- **Security headers** — `X-Content-Type-Options: nosniff` + `Referrer-Policy: strict-origin-when-cross-origin` set on all `/api/*` responses.

---

## Documentation

- **[USER_GUIDE.md](./USER_GUIDE.md)** — full website walkthrough for visitors, members, and admins (every page, every button)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Vercel + MongoDB Atlas deployment walkthrough
- **README.md** (this file) — developer setup, tech stack, folder layout, API surface

---

## Deploy

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full Vercel + MongoDB Atlas walkthrough.

Quick summary:

1. Switch `MONGODB_URI` to Atlas SRV string with `0.0.0.0/0` whitelisted
2. Push `web/` to GitHub
3. Import to Vercel → set env vars → deploy
4. Run `MONGODB_URI=<atlas> npm run seed` once locally to create the first admin in Atlas

`vercel.json` is already tuned for the **free Hobby tier** (max function duration 10s, security headers).

---

## License

Private — TPI CPC, Thakurgaon Polytechnic Institute. Not for commercial reuse without permission.
