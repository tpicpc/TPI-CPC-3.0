# Deploying to Vercel (free Hobby tier)

This app is tuned to run on **Vercel free tier + MongoDB Atlas free tier (M0) + ImgBB free + Gmail SMTP**. No paid services required.

---

## 1. Switch MongoDB to Atlas

Vercel functions can't reach `localhost`, so for production use MongoDB Atlas free tier (M0).

1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create a free **M0** cluster (`aws-mumbai` or `aws-singapore` are good for South Asia)
3. **Database Access** → Add user (username + strong password)
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

> Note: `.env.local`, `.next/`, and `node_modules/` are already in `.gitignore`.

---

## 3. Import to Vercel

1. https://vercel.com/new → import the GitHub repo
2. **Framework**: Next.js (auto-detected)
3. **Root Directory**: leave blank if `web/` is the repo root, otherwise set it to `web`
4. **Build / output / install**: leave defaults — `vercel.json` covers them
5. Click **Deploy** — first build will fail without env vars, expected

---

## 4. Set environment variables

In Vercel: **Project → Settings → Environment Variables**. Set for **Production + Preview + Development**:

| Key | Value |
|---|---|
| `MONGODB_URI` | Your Atlas SRV string from step 1 |
| `JWT_SECRET` | Random 32+ chars — generate with `openssl rand -hex 32` |
| `IMGBB_API_KEY` | `67f629cfcbbcd812713c0ca439b5d2cd` (or your own from https://api.imgbb.com/) |
| `EMAIL_USER` | `tpicpc@gmail.com` |
| `EMAIL_PASS` | `qken eamz vxuz yado` (Gmail App Password — keep the spaces) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain (e.g. `https://tpicpc.vercel.app`). Update if you add a custom domain |
| `ADMIN_SEED_EMAIL` | `admin@tpicpc.com` |
| `ADMIN_SEED_PASSWORD` | Strong password (only used by the seed script) |
| `ADMIN_SEED_NAME` | `TPI CPC Admin` |

Then **Deployments → Redeploy**.

---

## 5. Seed the first admin in Atlas

You need to create the admin record in Atlas **once**. Easiest way is to run the seed locally pointed at Atlas:

```bash
cd web
MONGODB_URI="<your atlas SRV string>" npm run seed
```

Output:
```
Admin created successfully:
  email:    admin@tpicpc.com
  password: <ADMIN_SEED_PASSWORD>
```

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

It does `deleteMany({})` first on each collection, so it's safe to re-run.

---

## 7. Verify the deploy

After Vercel finishes the build (1–2 min), open your domain and walk through:

- `/` should load home page with notice bar, About video, sections
- `/admin/login` — sign in with seeded admin
- `/signup` → 4-digit verification email arrives
- `/workshop` → enroll in a course → enrollment email arrives
- `/forgot-password` → 6-digit reset OTP arrives

If emails don't arrive: check **Function Logs** in Vercel for nodemailer errors. Most common issue is using a normal Gmail password instead of an **App Password** (you must enable 2FA on the Gmail account first to generate one at https://myaccount.google.com/apppasswords).

---

## Free-tier limits to be aware of

| Service | Free tier limit | Impact |
|---|---|---|
| **Vercel Hobby** | 100 GB bandwidth / month | Plenty for a club site |
| **Vercel Hobby** | 100 GB-hr serverless / month | Generous for a small site |
| **Vercel Hobby** | 10s max function duration | Already capped via `vercel.json` |
| **Vercel Hobby** | 4.5 MB request body | Image uploads capped at 4 MB client-side |
| **Atlas M0** | 512 MB storage, shared CPU | Don't store images here — we use ImgBB |
| **ImgBB** | Unlimited free hosting, no expiry | Used for all user/admin uploads |
| **Gmail SMTP** | 500 messages / day | Plenty for OTPs + enrollment emails on a club site |

---

## Custom domain

1. **Vercel → Project → Settings → Domains → Add `tpicpc.com`**
2. Update DNS A/CNAME records as Vercel instructs
3. SSL is automatic
4. Update `NEXT_PUBLIC_APP_URL` env var to the new domain → redeploy

---

## Cold-start tuning (already done)

`lib/db.js` is configured with:
- `bufferCommands: true` — first request after cold start waits for connection instead of throwing
- `maxPoolSize: 5`, `minPoolSize: 0` — small pool that scales down to zero between requests
- `serverSelectionTimeoutMS: 8000`, `socketTimeoutMS: 30000` — generous timeouts for Atlas handshake
- Promise cache cleared on connection failure — next request retries instead of failing forever

If you see "MongooseServerSelectionError" on the first request after the function sleeps, increase `serverSelectionTimeoutMS` in `lib/db.js`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Build fails with "Module not found" | Stale `package-lock.json` | Delete `node_modules` + `package-lock.json` locally, run `npm install`, commit, redeploy |
| 401 on `/admin/login` from working creds | Admin doesn't exist in Atlas | Re-run `npm run seed` pointed at Atlas |
| Images don't show after upload | `IMGBB_API_KEY` missing or invalid | Check env var; visit https://api.imgbb.com/ to confirm key |
| Verification emails don't send | Gmail blocks plain password | Enable 2FA on the Gmail account → generate App Password → use that |
| `MongooseServerSelectionError` on cold start | Atlas IP not whitelisted | Atlas → Network Access → confirm `0.0.0.0/0` is present |
| `/blogs` empty after migration | Legacy blogs missing `status` field | Run `node scripts/backfill-blog-status.mjs` against Atlas |
| Function timed out (10s) | Heavy operation on free tier | Audit slow API routes; consider upgrading to Pro for 60s |

---

## Post-launch

- Add a Google Analytics or Plausible script to `app/layout.jsx` if you want traffic stats
- Atlas → **Backup** is available on M10+; for M0 you can run `mongodump` periodically as a safety net
- Add the production domain to `next.config.mjs` `images.remotePatterns` if you ever need Next.js `<Image>` for it
