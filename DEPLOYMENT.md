# Deploying to Vercel (free Hobby tier) — v3.0

> Deployment guide for **TPI CPC v3.0** — the unified Next.js app.

This app is tuned to run on **Vercel free tier + MongoDB Atlas free tier (M0) + ImgBB free + Gmail SMTP**. No paid services required.

> Build verified: `next build` produces **107 routes** with zero errors. The repo is deploy-ready as-is — only environment variables need to be set in Vercel.

---

## 0. Pre-flight checklist

Before importing to Vercel, confirm locally:

```bash
cd web
npm install
npm run build      # should finish with "✓ Compiled successfully"
```

If the build fails locally, it will fail on Vercel too — fix it first.

You also need:

- A **GitHub repo** containing the `web/` folder (or the contents of it)
- A **MongoDB Atlas** account (free)
- A **Gmail** account with 2FA enabled (for App Password)
- An **ImgBB** API key (free, no expiry)

---

## 1. Switch MongoDB to Atlas

Vercel functions can't reach `localhost`, so for production use MongoDB Atlas free tier (M0).

1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create a free **M0** cluster (`aws-mumbai` or `aws-singapore` are good for South Asia)
3. **Database Access** → Add user (username + strong password, save them)
4. **Network Access** → Add IP `0.0.0.0/0` (required — Vercel serverless IPs are dynamic)
5. **Connect → Drivers → Node.js** → copy the SRV string:
   ```
   mongodb+srv://USER:PASS@cluster0.xxx.mongodb.net/tpicpc?retryWrites=true&w=majority&appName=Cluster0
   ```
6. Replace `USER` / `PASS` with real credentials, ensure `tpicpc` is the database name after `.net/`

---

## 2. Push `web/` to GitHub

From the `web/` folder:

```bash
git init
git add .
git commit -m "TPI CPC unified Next.js app"
git branch -M main
git remote add origin https://github.com/<you>/tpi-cpc-web.git
git push -u origin main
```

> Note: `.env.local`, `.next/`, and `node_modules/` are already in `.gitignore`. Verify with `git ls-files | grep env` — only `.env.local.example` should appear.

---

## 3. Import to Vercel

1. https://vercel.com/new → import the GitHub repo
2. **Framework**: Next.js (auto-detected)
3. **Root Directory**: leave blank if `web/` is the repo root, otherwise set it to `web`
4. **Build / output / install**: leave defaults — `vercel.json` covers them
5. Click **Deploy** — first build will fail without env vars, that's expected; continue to step 4

---

## 4. Set environment variables

In Vercel: **Project → Settings → Environment Variables**. Set for **Production + Preview + Development**:

| Key | Value | Notes |
|---|---|---|
| `MONGODB_URI` | Your Atlas SRV string from step 1 | Required at build time (sitemap reads it) |
| `JWT_SECRET` | Random 32+ chars — generate with `openssl rand -hex 32` | **Do NOT reuse** the dev value `tpicpc_dev_secret_change_me_in_production`; weak secret = compromised auth |
| `IMGBB_API_KEY` | `67f629cfcbbcd812713c0ca439b5d2cd` (or your own from https://api.imgbb.com/) | |
| `EMAIL_USER` | `tpicpc@gmail.com` | |
| `EMAIL_PASS` | Gmail **App Password** (16 chars, keep the spaces) | Requires 2FA on the Gmail account |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain (e.g. `https://tpicpc.vercel.app`) | Update if you add a custom domain |
| `ADMIN_SEED_EMAIL` | `admin@tpicpc.com` | Only used by the seed script |
| `ADMIN_SEED_PASSWORD` | Strong password | Only used by the seed script |
| `ADMIN_SEED_NAME` | `TPI CPC Admin` | Only used by the seed script |

Then **Deployments → Redeploy** to pick up the env vars.

---

## 5. Seed the first admin in Atlas

You need to create the admin record in Atlas **once**. Easiest way is to run the seed locally pointed at Atlas:

```bash
cd web
MONGODB_URI="<your atlas SRV string>" \
ADMIN_SEED_EMAIL="admin@tpicpc.com" \
ADMIN_SEED_PASSWORD="<strong password>" \
ADMIN_SEED_NAME="TPI CPC Admin" \
npm run seed
```

Output:

```
Admin created successfully:
  email:    admin@tpicpc.com
  password: <ADMIN_SEED_PASSWORD>
```

Re-running is safe — the script upserts.

---

## 6. (Optional) Bring in the live tpicpc.com data

The `import:live` script scrapes `https://api.tpicpc.com` and the older `https://tpicpc.vercel.app/team` HTML to populate Atlas with:

- 11 advisors
- ~32 team members across 2025 / 2024 / 2023
- 7 events
- 5 blogs
- 2 reviews
- Auto-detected gender (best-effort)

```bash
MONGODB_URI="<atlas>" npm run import:live
```

It does `deleteMany({})` first on each collection, so it's safe to re-run — but it **wipes** existing content first. Don't run it after you've added real production data.

If legacy blogs end up without a `status` field (older shape), run:

```bash
MONGODB_URI="<atlas>" node scripts/backfill-blog-status.mjs
```

---

## 7. Verify the deploy

After Vercel finishes the build (1–2 min), open your domain and walk through:

- `/` should load home page with notice bar, About video, sections
- `/sitemap.xml` should list static pages + dynamic blogs/workshops
- `/robots.txt` should disallow `/admin`, `/api`, `/profile`
- `/admin/login` — sign in with seeded admin
- `/signup` → 4-digit verification email arrives
- `/workshop` → enroll in a course → enrollment email arrives
- `/forgot-password` → 6-digit reset OTP arrives
- Dark mode toggle persists on reload
- `/dashboard` after login — stat tiles load

If emails don't arrive: check **Function Logs** in Vercel for nodemailer errors. Most common issue is using a normal Gmail password instead of an **App Password** (you must enable 2FA on the Gmail account first to generate one at https://myaccount.google.com/apppasswords).

---

## Free-tier limits to be aware of

| Service | Free tier limit | Impact |
|---|---|---|
| **Vercel Hobby** | 100 GB bandwidth / month | Plenty for a club site |
| **Vercel Hobby** | 100 GB-hr serverless / month | Generous for a small site |
| **Vercel Hobby** | 10s max function duration | Already capped via `vercel.json` |
| **Vercel Hobby** | 4.5 MB request body | Image uploads capped at 4 MB client-side |
| **Vercel Hobby** | 1 region only | Already pinned to `sin1` (Singapore) |
| **Atlas M0** | 512 MB storage, shared CPU | Don't store images here — we use ImgBB |
| **Atlas M0** | 100 connections | Pool capped at 5 in `lib/db.js` |
| **ImgBB** | Unlimited free hosting, no expiry | Used for all user/admin uploads |
| **Gmail SMTP** | 500 messages / day | Plenty for OTPs + enrollment emails on a club site |

---

## Custom domain

1. **Vercel → Project → Settings → Domains → Add `tpicpc.com`**
2. Update DNS A/CNAME records as Vercel instructs
3. SSL is automatic
4. Update `NEXT_PUBLIC_APP_URL` env var to the new domain → redeploy
5. (Optional) Add the new domain to `next.config.mjs` `images.remotePatterns` if you ever need Next.js `<Image>` for it

---

## Cold-start tuning (already done)

`lib/db.js` is configured with:

- `bufferCommands: true` — first request after cold start waits for connection instead of throwing
- `maxPoolSize: 5`, `minPoolSize: 0` — small pool that scales down to zero between requests
- `serverSelectionTimeoutMS: 8000`, `socketTimeoutMS: 30000` — generous timeouts for Atlas handshake
- Promise cache cleared on connection failure — next request retries instead of failing forever

If you see "MongooseServerSelectionError" on the first request after the function sleeps, increase `serverSelectionTimeoutMS` in `lib/db.js`.

---

## Security checklist before going live

- [ ] `JWT_SECRET` in Vercel is a **fresh** 32+ char random string (NOT the dev placeholder)
- [ ] `ADMIN_SEED_PASSWORD` is strong; change the seeded admin's password from `/admin/profile` after first login
- [ ] `MONGODB_URI` user has only read/write on the `tpicpc` DB, not cluster admin
- [ ] Gmail App Password used (not the real account password)
- [ ] `.env.local` is **not** committed (verify `git ls-files | grep env` returns only `.env.local.example`)
- [ ] Atlas Network Access only has `0.0.0.0/0` (required for Vercel) — no other untrusted entries
- [ ] After deploy, log in to `/admin` and rotate the seed password

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Build fails with "Module not found" | Stale `package-lock.json` | Delete `node_modules` + `package-lock.json` locally, run `npm install`, commit, redeploy |
| Build fails with "MONGODB_URI is not defined" | Env var not set in Vercel | Settings → Environment Variables → add it for all environments → redeploy |
| 401 on `/admin/login` from working creds | Admin doesn't exist in Atlas | Re-run `npm run seed` pointed at Atlas |
| `secretOrPrivateKey must have a value` in function logs | `JWT_SECRET` env var missing | Set it in Vercel → redeploy |
| Images don't show after upload | `IMGBB_API_KEY` missing or invalid | Check env var; visit https://api.imgbb.com/ to confirm key |
| Verification emails don't send | Gmail blocks plain password | Enable 2FA on the Gmail account → generate App Password → use that |
| `MongooseServerSelectionError` on cold start | Atlas IP not whitelisted | Atlas → Network Access → confirm `0.0.0.0/0` is present |
| `/blogs` empty after migration | Legacy blogs missing `status` field | Run `node scripts/backfill-blog-status.mjs` against Atlas |
| Function timed out (10s) | Heavy operation on free tier | Audit slow API routes; consider upgrading to Pro for 60s |
| `/sitemap.xml` is empty | Build couldn't reach Atlas during build | Verify `MONGODB_URI` is in **all** environments (Production AND Preview AND Development) |
| Image upload fails with 413 / "Payload Too Large" | File over 4.5 MB | Compress before upload; signup form already caps at 4 MB |
| Dark mode flashes white on load | Pre-hydration FOUC | Already mitigated with `suppressHydrationWarning` on `<html>` |

---

## Continuous deployment

Once imported, Vercel auto-deploys on every `git push`:

- Pushes to `main` → Production
- Pushes to other branches → Preview deployment with unique URL
- Pull requests → Preview comment with the URL

To force a redeploy without a new commit: **Deployments → … → Redeploy**.

---

## Post-launch

- Add a Google Analytics or Plausible script to `app/layout.jsx` if you want traffic stats
- Atlas → **Backup** is available on M10+; for M0 you can run `mongodump` periodically as a safety net:
  ```bash
  mongodump --uri="<atlas SRV>" --out=./backup-$(date +%F)
  ```
- Set up **Vercel Web Analytics** (free, privacy-friendly) under Project → Analytics
- Monitor **Function Logs** weekly for any silent errors (mailer failures, ImgBB rate limits)
- If traffic grows, upgrade Atlas to M2 (~$9/mo) for dedicated CPU + automated backups

---

## Rollback

If a deploy breaks production:

1. **Deployments** tab → find the last working deploy
2. Click `…` → **Promote to Production**
3. Done — no rebuild needed, instant rollback

For DB rollback, restore from the most recent `mongodump` backup (M0 has no automated backups).
