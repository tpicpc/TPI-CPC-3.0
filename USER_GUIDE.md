# TPI CPC — Full User Guide (v3.0)

A walkthrough of every feature in the website, written for three audiences:

1. **Visitors** — anyone browsing the public site
2. **Members** — students with a registered account
3. **Admins** — club leadership managing content

> Public site: https://tpicpc.vercel.app · Admin panel: https://tpicpc.vercel.app/admin/login

---

## Table of contents

- [1. Visitor guide (no login needed)](#1-visitor-guide-no-login-needed)
  - [1.1 Home page](#11-home-page)
  - [1.2 Teams & Advisors](#12-teams--advisors)
  - [1.3 Events](#13-events)
  - [1.4 Workshops (LMS)](#14-workshops-lms)
  - [1.5 Projects showcase](#15-projects-showcase)
  - [1.6 Forum (Q&A)](#16-forum-qa)
  - [1.7 Resource library](#17-resource-library)
  - [1.8 Blogs](#18-blogs)
  - [1.9 Leaderboard](#19-leaderboard)
  - [1.10 Testimonials & Reviews](#110-testimonials--reviews)
  - [1.11 Member profiles](#111-member-profiles)
  - [1.12 Certificate verification](#112-certificate-verification)
  - [1.13 Dark mode](#113-dark-mode)
- [2. Member guide (sign up & log in)](#2-member-guide-sign-up--log-in)
  - [2.1 Creating an account](#21-creating-an-account)
  - [2.2 Email verification](#22-email-verification)
  - [2.3 Logging in](#23-logging-in)
  - [2.4 Forgot password](#24-forgot-password)
  - [2.5 Member dashboard](#25-member-dashboard)
  - [2.6 Editing your profile & username](#26-editing-your-profile--username)
  - [2.7 Enrolling in a workshop](#27-enrolling-in-a-workshop)
  - [2.8 Submitting a project](#28-submitting-a-project)
  - [2.9 Submitting a blog](#29-submitting-a-blog)
  - [2.10 Asking & answering questions in the forum](#210-asking--answering-questions-in-the-forum)
  - [2.11 Earning & viewing certificates](#211-earning--viewing-certificates)
  - [2.12 Logging out](#212-logging-out)
- [3. Admin guide](#3-admin-guide)
  - [3.1 Logging in to the admin panel](#31-logging-in-to-the-admin-panel)
  - [3.2 Dashboard overview](#32-dashboard-overview)
  - [3.3 Managing members](#33-managing-members)
  - [3.4 Managing teams](#34-managing-teams)
  - [3.5 Managing advisors](#35-managing-advisors)
  - [3.6 Managing events](#36-managing-events)
  - [3.7 Managing workshops (LMS)](#37-managing-workshops-lms)
  - [3.8 Moderating blogs](#38-moderating-blogs)
  - [3.9 Moderating projects](#39-moderating-projects)
  - [3.10 Moderating forum questions](#310-moderating-forum-questions)
  - [3.11 Managing resources](#311-managing-resources)
  - [3.12 Issuing certificates](#312-issuing-certificates)
  - [3.13 Notice bar](#313-notice-bar)
  - [3.14 Reviews moderation](#314-reviews-moderation)
  - [3.15 Leaderboard](#315-leaderboard)
  - [3.16 Admin profile & password](#316-admin-profile--password)
- [4. FAQ](#4-faq)
- [5. Need help?](#5-need-help)

---

## 1. Visitor guide (no login needed)

### 1.1 Home page

The landing page (`/`) shows everything in one scroll:

- **Notice bar** — animated marquee at the top with current announcements (dismissable)
- **Hero** — animated tagline + "Join the club" CTA
- **Counter** — live stats (members, workshops, events, projects)
- **About TPI CPC** — short intro + embedded YouTube video
- **Why join** — value-prop cards
- **Advisors** — meet the mentor team
- **Team members** — current year's executive committee
- **Upcoming events** — six most recent events
- **Blogs** — three latest articles
- **Reviews** — what students say
- **FAQs** — quick answers
- **Contact** — direct contact form

### 1.2 Teams & Advisors

- `/teams` — current-year team members on top, prior years grouped as **Ex Team**.
- President is always first, then VP, GS, Treasurer, etc. Click any photo to see socials.
- Advisors appear on the home page and are color-coded by tier (Senior / Junior / Co-Advisor).

### 1.3 Events

- `/events` — all events with status filter: **Upcoming**, **Ongoing**, **Completed**.
- Click an event card to see full details, datetime, location, and description.

### 1.4 Workshops (LMS)

- `/workshop` — two sections: **Available Now** and **Coming Soon**.
- Open a workshop to see lessons, instructor, level, duration.
- Lesson video is **locked** until you log in, verify your email, and click **Enroll**.
- Once enrolled, lessons play in order with autoplay-next; progress is tracked.

### 1.5 Projects showcase

- `/projects` — gallery of member-built projects. Filter and sort.
- Click a project for screenshots, GitHub link, live demo, **likes**, and **comments**.
- Posting a comment requires being logged in + email-verified.

### 1.6 Forum (Q&A)

- `/forum` — StackOverflow-style discussion. Tabs: **Newest**, **Top**, **Unanswered**.
- Filter by tag (e.g. `python`, `react`, `dsa`).
- Click a question for upvotes, answers, and accepted-answer flag.
- Reading is free — asking, answering, and voting need login + verification.

### 1.7 Resource library

- `/resources` — curated downloads: Notes, Cheat Sheets, E-books, Tutorials.
- Filter by category. Click **Download** to fetch (counter increments).
- Resources are hosted on Drive / Dropbox / external — no account needed to download.

### 1.8 Blogs

- `/blogs` — published articles only. Click any card for the full HTML article.
- Anyone can submit a blog (login required) — admin reviews before it appears here.

### 1.9 Leaderboard

- `/leaderboard` — two tabs:
  - **Yearly** — admin-curated top performers with badges
  - **By Courses** — auto-computed from workshop enrollments

### 1.10 Testimonials & Reviews

- `/testimonials` — student stories, sortable.
- `/add-review` — submit your own (login required).

### 1.11 Member profiles

- `/members/<username>` (or `/members/<id>`) — public profile of any member.
- Shows stats, projects, blogs, and enrolled courses.

### 1.12 Certificate verification

- `/certificate/<number>` — anyone can open a certificate URL to verify it's authentic.
- Browser print → save as PDF for download.

### 1.13 Dark mode

- Toggle via the sun/moon icon in the navbar (or in the dashboard header).
- Choice persists across reloads. New visitors get the system preference.

---

## 2. Member guide (sign up & log in)

### 2.1 Creating an account

1. Click **Sign Up** in the navbar (or visit `/signup`).
2. **Step 1 — About you**:
   - Upload an optional profile picture (max 4 MB).
   - Enter full name, email, mobile number.
3. **Step 2 — Academic & security**:
   - Roll number, department (Computer / Civil / Electrical / Electronics / Power / Mechanical / Other), shift (1st / 2nd).
   - Password (6+ chars; uppercase + number recommended).
4. Click **Create account**.

A 4-digit verification code is emailed to you. The page redirects to `/verify-email`.

### 2.2 Email verification

1. Open your email — find the message from **TPI CPC** with subject "Verify your TPI CPC account".
2. Copy the **4-digit code**.
3. Paste it on `/verify-email` and submit.
4. If you didn't receive it, click **Resend** (60-second cooldown). Check spam folder if it doesn't arrive.

You'll land on `/dashboard` once verified.

> Why verification? You can browse without it, but **enrolling, posting, commenting, and reviewing all require a verified email**.

### 2.3 Logging in

1. Visit `/login`.
2. Enter email + password.
3. If your email isn't verified yet, you're sent to `/verify-email` first.
4. Once verified, you land on `/dashboard`.

### 2.4 Forgot password

1. On the login page, click **Forgot password?**.
2. Enter your registered email — a 6-digit OTP is emailed (10-minute expiry).
3. Enter the OTP on the page.
4. Set a new password.

### 2.5 Member dashboard

After login, `/dashboard` shows:

- **Welcome banner** with your name, username, and a verify CTA if needed
- **Stat tiles** (clickable): Enrolled courses · Certificates · Projects · Blogs
- **Quick actions**: Find course · Submit project · Write blog · Ask question
- **Activity breakdown** by status (approved / pending / rejected, plus total likes)

Sub-pages in the sidebar:

- `/dashboard/profile` — edit name, photo, username, password
- `/dashboard/enrollments` — courses you've enrolled in
- `/dashboard/certificates` — earned certificates
- `/dashboard/projects` — your submitted projects (with status)
- `/dashboard/blogs` — your submitted blogs (with status)
- `/dashboard/questions` — your forum activity

### 2.6 Editing your profile & username

1. Open `/dashboard/profile`.
2. Update photo, full name, mobile, roll, department, shift.
3. **Username** — type a new one; the form checks availability in real time.
   - 3–24 chars, lowercase letters / numbers / underscores only.
   - Once changed, your public profile URL becomes `/members/<new-username>`.
4. To change password: enter old + new password.
5. Click **Save changes**.

### 2.7 Enrolling in a workshop

1. Browse `/workshop` and pick one marked **Available Now**.
2. Click the course → you'll see lesson titles but the video is locked.
3. Click **Enroll** (only works if email verified).
4. You'll get an enrollment confirmation email immediately.
5. The lesson player unlocks. The first lesson auto-plays; finishing one auto-advances to the next.
6. Progress is tracked per lesson — pick up where you left off any time.

### 2.8 Submitting a project

1. Visit `/submit-project` (or click **Submit project** on the dashboard).
2. Fill in:
   - Title, description, tags
   - GitHub link, live demo link
   - Screenshots (multiple, ImgBB-hosted)
3. Submit → status is **Pending**.
4. Admin reviews → status becomes **Approved** (visible on `/projects`) or **Rejected** (with reason).

### 2.9 Submitting a blog

1. Visit `/submit-blog`.
2. Title, cover image, rich text content (Quill editor — formatting, images, code blocks, lists).
3. Submit → status is **Pending**.
4. Once approved, it appears on `/blogs` under your authorship.

### 2.10 Asking & answering questions in the forum

**Ask:**

1. Click **Ask Question** on `/forum` (or visit `/forum/ask`).
2. Title, body, tags (e.g. `python`, `dsa`).
3. Submit.

**Answer:**

1. Open any question.
2. Type your answer in the box at the bottom.
3. Submit.

**Vote / accept:**

- Upvote any question or answer (one vote per user).
- The asker can mark one answer as **accepted** — that one floats to the top.

### 2.11 Earning & viewing certificates

- Certificates are issued by admins for course completion or event participation.
- When issued, you'll see them at `/dashboard/certificates`.
- Click **View** to open the printable certificate at `/certificate/<number>` — use browser print → save as PDF.
- Anyone with the certificate number can verify authenticity by opening the same URL.

### 2.12 Logging out

- Click your avatar (top-right) → **Log out**, or hit the logout icon in the dashboard sidebar.
- Your session token is removed from local storage.

---

## 3. Admin guide

> Only the seeded admin (or admins you create) can access these pages. The admin login is **separate** from member login.

### 3.1 Logging in to the admin panel

1. Visit `/admin/login`.
2. Enter your admin email + password.
3. You land on `/admin` (dashboard overview).

Forgot admin password? Click **Forgot password?** → 6-digit OTP via email → reset.

### 3.2 Dashboard overview

`/admin` shows live stat cards:

- Members · Teams · Advisors · Events · Workshops · Blogs · Projects · Reviews · Notices · Leaderboard entries

Use the sidebar to jump to any management page.

### 3.3 Managing members

`/admin/users`

- Search by name / email / username
- Filter by **verified** / **unverified**
- Click a row to see full detail: profile, enrollments, suspension status
- **Suspend** with a reason (user gets the reason on next login attempt)
- **Ban** to fully block access
- Reverse either by clicking **Reactivate**

### 3.4 Managing teams

`/admin/teams`

1. **New** → fill name, position, year, gender, photo, social URLs.
2. Position presets ensure correct ordering (President → VP → GS → ...).
3. Year groups members automatically. Older years auto-archive as Ex Team on `/teams`.
4. Edit / delete from the list.

### 3.5 Managing advisors

`/admin/advisors`

- Add advisors with tier (Senior / Junior / Co-Advisor)
- Tier determines the card color on the home page

### 3.6 Managing events

`/admin/events`

- Title, description, banner image, datetime, location
- Status: **Upcoming / Ongoing / Completed**
- Visible on `/events` immediately after save

### 3.7 Managing workshops (LMS)

`/admin/workshops`

1. **New workshop** → title, slug (auto-generated), category, level, instructor, thumbnail, description.
2. Add lessons:
   - Each lesson has title, YouTube URL (or playlist URL), duration, order.
   - Drag to reorder.
   - The site extracts the video ID and embeds it on the public side.
3. Set **status**:
   - **Draft** — only admins see it
   - **Published** — visible on `/workshop`, requires enrollment to watch
   - **Coming Soon** — preview card with release date
4. Save → enrolled members get autoplay-next through the playlist.

### 3.8 Moderating blogs

`/admin/blogs`

- Pending queue at the top
- Click a blog → preview the rendered HTML → **Approve** or **Reject**
- Admins can also write blogs directly via `/admin/blogs/new`

### 3.9 Moderating projects

`/admin/projects`

- Pending queue at the top
- Click a project → see screenshots, links, description → **Approve** or **Reject**
- Toggle **Featured** to pin a project on `/projects`

### 3.10 Moderating forum questions

`/admin/forum`

- List of all questions and answers
- Delete spam questions or answers — they disappear from `/forum` immediately

### 3.11 Managing resources

`/admin/resources`

1. **New** → title, description, category (dynamic — type a new one to add it), file URL.
2. URL can point to Drive, Dropbox, GitHub, or any direct download link.
3. Public users see the download counter increment on click.

### 3.12 Issuing certificates

`/admin/certificates`

1. **Issue certificate** → pick a member, type (Course / Event), course or event reference, completion date.
2. A unique certificate number is generated automatically.
3. The member sees it under `/dashboard/certificates`.
4. Anyone can verify at `/certificate/<number>`.

### 3.13 Notice bar

`/admin/notices`

- Title + optional link
- Toggle **Active** to show on the public site
- Set **priority** (multiple active notices rotate by priority)
- Optional **expiry date** — auto-hides after that date
- Public users can dismiss; the dismissal persists per visitor

### 3.14 Reviews moderation

`/admin/reviews`

- All submitted student reviews
- Toggle **Approved** to show on `/testimonials`
- Delete spam outright

### 3.15 Leaderboard

`/admin/leaderboard`

- **Yearly entries** — pick year, member, rank, badge (Gold / Silver / Bronze)
- The **By Courses** tab on the public side is auto-computed from enrollments — no admin action needed

### 3.16 Admin profile & password

`/admin/profile`

- Update your admin name, photo
- Change password (leave blank to keep current)
- Email is fixed — contact the original admin to change it

> 🔒 **Right after first login, change the seeded password.**

---

## 4. FAQ

**Q: I signed up but never got the verification email.**
Check spam folder. Click **Resend** on `/verify-email` (60s cooldown). If still missing, the Gmail App Password might be misconfigured — admins should check Vercel function logs.

**Q: My profile picture upload failed.**
Files must be under **4 MB**. Try a smaller image. Background: Vercel Hobby caps request body at 4.5 MB.

**Q: I enrolled but the lessons are still locked.**
Refresh the page. If still locked, your email might not be verified yet (`/verify-email`). Verification is required even after enrollment.

**Q: My project / blog has been "Pending" for days.**
Admins moderate manually. Drop a polite reminder in the contact form or message a club lead.

**Q: How do I change my username?**
`/dashboard/profile` → type a new username (live availability check) → save. The change updates your `/members/<username>` URL.

**Q: I forgot my password.**
`/forgot-password` (or `/admin/forgot-password` for admins) → 6-digit email OTP → reset.

**Q: Can I delete my account?**
Not via the UI yet — email **tpicpc@gmail.com** with your registered email and we'll handle it.

**Q: Is my data safe?**
Passwords are bcrypt-hashed, JWT secret is rotated per environment, all admin/API endpoints require auth, MongoDB is on a private Atlas cluster. Only basic profile fields are stored.

**Q: Can I use the site on mobile?**
Yes — responsive on every page. Sidebars collapse to a hamburger on small screens.

---

## 5. Need help?

- **Email** — tpicpc@gmail.com
- **Facebook group** — https://web.facebook.com/groups/tpicpc
- **GitHub issues** — for site bugs or feature requests
- **In-person** — visit the CPC room at Thakurgaon Polytechnic Institute during club hours

For developers / contributors, see [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md).

---

**TPI CPC v3.0** · Computer & Programming Club, Thakurgaon Polytechnic Institute
