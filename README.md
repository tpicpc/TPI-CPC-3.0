# TPI CPC — Unified Next.js App

A single Next.js 15 application that serves the **public website**, the **member dashboard**, the **admin panel**, and the **REST API**. Built to deploy free on Vercel + MongoDB Atlas + ImgBB.

> Computer & Programming Club — Thakurgaon Polytechnic Institute

---

## Tech stack
- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS** + Radix UI primitives + Lucide icons + Framer Motion
- **MongoDB** with Mongoose
- **JWT** auth (separate user and admin sessions)
- **ImgBB** for free unlimited image hosting
- **Nodemailer** (Gmail SMTP) for OTP, verification, and enrollment emails
- **react-quill-new** for the rich text editor

---

## Quick start

```bash
cd web
npm install
cp .env.local.example .env.local   # then fill in values
npm run seed                       # creates the first admin
npm run dev
```

Visit:
- `http://localhost:3000` — public site
- `http://localhost:3000/dashboard` — member dashboard (after login)
- `http://localhost:3000/admin/login` — admin panel (`admin@tpicpc.com / admin123`)

---

## Environment variables

| Key | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection (local for dev, Atlas SRV for prod) |
| `JWT_SECRET` | Random string for signing JWTs |
| `IMGBB_API_KEY` | Free key from https://api.imgbb.com/ |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address + App Password (for OTP / verify / enrollment emails) |
| `NEXT_PUBLIC_APP_URL` | Site URL — used by sitemap, robots, email templates |
| `ADMIN_SEED_*` | Email / password / name used by `npm run seed` |

If `EMAIL_*` vars are unset, OTPs are logged to the server console (fine for dev).

---

## Folder structure

```
app/
  (public)/        Public pages: home, teams, events, workshop, projects, forum, resources, blogs, leaderboard, members, ...
  (auth)/          Login / signup / forgot-password / verify-email
  dashboard/       Logged-in member dashboard (sidebar layout)
  admin/           Admin dashboard (sidebar layout)
  api/v1/          Backend API route handlers
  certificate/     Public printable certificate page
  profile/         Legacy redirect for old /profile links
components/
  ui/              Button, Card, Input, Skeleton, Select, Tooltip, ...
  admin/           Admin-only widgets (Sidebar, Topbar, forms, ConfirmDialog, RichTextEditor, LessonsManager)
  dashboard/       Member dashboard sidebar
  skeletons.jsx    Reusable shimmer loading skeletons
  Navbar / Footer / NoticeBar / Hero / Counter / WhyJoin / SectionTitle / TeamMember / AdvisorCard / FlipWords / AboutSection / ContactSection / HomeFAQs
contexts/          Theme · User · Admin · HomeData providers
lib/
  db.js            Cached Mongoose connection (Vercel-tuned)
  auth.js          JWT helpers + Bearer/cookie extraction
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
- **Dark mode** with system preference detection
- **Loading skeletons** with shimmer animation on every async page

### Auth
- Signup with **two-step polished form** (about you → academic & security)
- **4-digit email verification** required before enrollment / posting / commenting (auto-resend with 60s cooldown)
- **Unique auto-generated username** (slugified from full name) — editable later in dashboard with **real-time availability check**
- Login with verified-redirect flow
- Forgot password (6-digit OTP via email)
- Atlas-tuned Mongoose connection that survives Vercel cold starts

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
  - **Members** — search, verified filter, view detail with enrollments
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

## Phases — all done

- [x] **Phase 1** — Scaffold, public pages, models, read-only API
- [x] **Phase 2** — Auth (user + admin), full API write routes, ImgBB upload
- [x] **Phase 3** — Admin panel for original entities
- [x] **Phase 4** — Workshops/LMS, Notice bar, Leaderboard, year-based teams
- [x] **Phase 5** — Auth UX polish, admin reset, SEO, deployment config
- [x] **Phase 6** — Live data import, original site styling, dark/light mode, mobile navbar
- [x] **Phase 7** — Course enrollment + welcome emails + email verification
- [x] **Phase 8** — Project showcase, member profiles, username system, Forum, Resource Library, Certificates, Member dashboard, loading skeletons, Vercel hardening

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (107 pages) |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run seed` | Create the first admin from `ADMIN_SEED_*` env vars |
| `npm run import:live` | Scrape `https://api.tpicpc.com` + `https://tpicpc.vercel.app` to populate Atlas with advisors, multi-year teams, events, blogs, reviews |

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

## Deploy

See **`DEPLOYMENT.md`** for the full Vercel + MongoDB Atlas walkthrough.

Quick summary:
1. Switch `MONGODB_URI` to Atlas SRV string with `0.0.0.0/0` whitelisted
2. Push `web/` to GitHub
3. Import to Vercel → set env vars → deploy
4. Run `MONGODB_URI=<atlas> npm run seed` once locally to create the first admin in Atlas

`vercel.json` is already tuned for the **free Hobby tier** (max function duration 10s, security headers).
