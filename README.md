# Bulkify

**Train. Eat. Progress.** A bilingual (English / العربية) gym and nutrition tracker for a small group of friends.
Installable as a phone app (PWA), dark-first, built with Next.js, Supabase and Netlify, all on free plans.

- **Calories & macros calculator:** Mifflin-St Jeor BMR → TDEE → target for cutting / constant / bulking, with protein,
  carbs and fat. Height, weight and goal are required before the app opens, and every month the app asks for your weight
  again and updates your targets.
- **Gym:** 592-exercise library (EN + AR) with fuzzy search, custom exercises, a weekly program, a required workout name,
  up to 9 exercises per workout and 5 sets per exercise (0–120 kg, ±5 kg), remove any set, notes, and the PR of every exercise.
- **Nutrition:** 630 foods from `Lebanon_Food_Database_cleaned.csv` with Arabic names. One breakfast, lunch and dinner a day,
  unlimited snacks and custom meals, a manual entry box, daily note. Every macro bar goes from red to green as you reach your target.
- **Home:** today's exercises and today's calories/protein against your targets (tap either to see the list), plus the dates you
  started Bulkify and the gym.
- **Calendar** (from the header): year → month → day, with green / red months and days.
- **Progress:** training this week vs. last week, nutrition vs. needed for 1 day to 1 year or a custom range, and your top 5 lifts.
- Made by **Kareem Bahri**: [instagram.com/kareem_bahri](https://www.instagram.com/kareem_bahri/)

---

## What you need

- A free [GitHub](https://github.com) account, a free [Netlify](https://netlify.com) account, and your **existing** Supabase project.
- [Node.js 20+](https://nodejs.org) on your computer (only needed to run it locally).

> **Safe for your existing Supabase project.** Every table, function, trigger and policy Bulkify creates starts with `bulkify_`.
> The SQL never drops, renames or changes anything else, and every file can be run more than once.

---

## 1 · Clone and install

```bash
git clone https://github.com/<you>/bulkify.git
cd bulkify
npm install
```

## 2 · Find your Supabase URL and public key

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) and choose your **existing** project.
2. Go to **Project Settings → API** (or click **Connect** at the top → **App Frameworks**).
3. Copy:
   - **Project URL**, which looks like `https://abcdefghijklm.supabase.co` → `NEXT_PUBLIC_SUPABASE_URL`
   - the **anon public** key (newer projects call it the **publishable** key, starting with `sb_publishable_`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> ⚠️ **Never** use the `service_role` / **secret** key in this app, in Netlify, or in Git. The app only needs the public key.
> Row Level Security makes sure each person can only see their own data.

## 3 · Create the database tables (Supabase SQL editor)

In Supabase, open **SQL Editor → New query**. For each file below **in this order**, paste the whole file and click **Run**:

| # | File | What it does |
|---|------|--------------|
| 1 | `supabase/migrations/001_bulkify_tables.sql` | Tables, indexes and every limit as a CHECK constraint (20 / 250 / 300 characters, 0–120 kg, sets 1–5, reps > 0) |
| 2 | `supabase/migrations/002_bulkify_functions.sql` | Trigger that blocks a 6th set, profile bootstrap, daily nutrition totals, atomic set saving |
| 3 | `supabase/migrations/003_bulkify_rls.sql` | Row Level Security on every `bulkify_` table, and table access for signed-in users |
| 4 | `supabase/migrations/004_bulkify_v2.sql` | Body & goal fields, the weight log, meal types (one breakfast / lunch / dinner a day), the 9-exercise limit |
| 5 | `supabase/migrations/010_seed_exercises.sql` | The 592-exercise library (English + Arabic) |
| 6 | `supabase/migrations/011_seed_foods.sql` | The 630 foods from the CSV, with Arabic names |

**Updating from an earlier Bulkify?** Run `003_bulkify_rls.sql` and `004_bulkify_v2.sql` again. Your data stays.

"Success. No rows returned" is normal. Running a file again is harmless.

The two seed files are generated from `tools/exercises.txt`, `tools/food_ar.txt` and `supabase/seed/Lebanon_Food_Database_cleaned.csv`.
If you edit those lists, run `python3 tools/gen_seeds.py`, then re-run files 5 and 6.

### Optional: a demo account with 2 months of data

1. **Authentication → Users → Add user → Create new user**, e.g. `demo@bulkify.app` with a password, and tick **Auto Confirm User**.
2. Copy the new user's **UID**.
3. Run `supabase/migrations/020_demo_data.sql` in the SQL editor (after 004), then run:
   ```sql
   select public.bulkify_seed_demo('PASTE-THE-UID-HERE');
   ```
4. Sign in as the demo user to review the charts. To remove everything later:
   ```sql
   select public.bulkify_remove_demo('PASTE-THE-UID-HERE');
   ```
   then delete the user in **Authentication → Users**. (The app itself can't call these two functions.)

## 4 · Run it on your computer

```bash
cp .env.example .env.local      # then paste your URL and anon/publishable key into .env.local
npm install
npm run dev                     # open http://localhost:3000
```

Create your account on the sign-in screen. Your Bulkify profile and a default weekly program are created on first sign-in,
then the app asks for your body data and goal.

- `npm test` runs the unit tests (calculator, colour rules, monthly weigh-in, gym maths).
- `npm run typecheck` checks the TypeScript (optional).

### Try it on your phone before deploying

1. Phone and computer on the **same Wi-Fi**.
2. On Windows, run `ipconfig` and find **IPv4 Address** under your **Wi-Fi** adapter (looks like `192.168.1.23`).
   Ignore addresses from "vEthernet (WSL)" or "Hyper-V" adapters such as `172.26.x.x`: a phone can't reach those.
3. On the phone, open `http://192.168.1.23:3000` (your number). If Windows asks whether Node.js may use the network, allow **Private networks**.
4. The dev server is slow and compiles each page on first open. For the real speed, use the Netlify site (step 5).

## 5 · Put it online with Netlify

1. Push the project to a GitHub repository (`.env.local` is ignored by Git, so your keys stay private):
   ```bash
   git init && git add . && git commit -m "Bulkify"
   git branch -M main
   git remote add origin https://github.com/<you>/bulkify.git
   git push -u origin main
   ```
2. In Netlify: **Add new site → Import an existing project → GitHub**, then choose the repo.
   Netlify detects Next.js, and the build settings come from `netlify.toml` (`npm run build`, Node 20).
3. **Site configuration → Environment variables → Add a variable**, and add both:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Site configuration → Site details → Change site name** → `bulkify`, so your address is **https://bulkify.netlify.app**.
   If the name is taken, pick another and use that address below.
5. **Deploys → Trigger deploy → Deploy site**. The variables are baked in at build time, so redeploy whenever you change them.

## 6 · Point Supabase Auth at your Netlify address

This makes the email-confirmation and password-reset links open Bulkify:

1. Supabase → **Authentication → URL Configuration**.
2. **Site URL**: `https://bulkify.netlify.app`
3. **Redirect URLs** → **Add URL**, one at a time:
   - `https://bulkify.netlify.app/**`
   - `http://localhost:3000/**` (for local development)

> **Sharing the Supabase project with another app?** The Site URL applies to the whole project. If your other app already uses it,
> leave it alone and just add the Bulkify addresses to **Redirect URLs**: Bulkify always tells Supabase where to send its links.

## 7 · Optional: your own domain

Netlify → **Domain management → Add a domain**, then follow the DNS steps (HTTPS is automatic). Add the new domain to
the Supabase **Redirect URLs** too (and to the Site URL if Bulkify owns the project).

---

## Install it on your phone

Open the site in **Safari (iPhone)** → Share → **Add to Home Screen**, or in **Chrome (Android)** → ⋮ → **Install app**.
It opens full-screen with the Bulkify icon and splash screen.

## Keep the free database awake

Free Supabase projects **pause after 1 week without activity**. Using Bulkify regularly keeps it awake. If it does pause,
open the Supabase dashboard and click **Restore project**. Your data is kept.

## Back up your data

The free plan has **no automatic backups**. In Bulkify, go to **Settings → Your data** to download everything as JSON,
or download Workouts and Meals as CSV (they open in Excel / Google Sheets with the Arabic intact). Do it now and then.

## Users

Bulkify is built for you and about 4 friends, each with their own email and password.
Auth users are shared with any other app in the same Supabase project. Bulkify only treats people **with a Bulkify profile**
as Bulkify users (Row Level Security enforces this), and that profile is created the first time they sign in to Bulkify.
Once your friends have joined, you can stop new sign-ups under **Authentication → Sign In / Providers → Allow new users to sign up**
(this setting covers the whole project, so only turn it off if your other app doesn't need new sign-ups).

---

## Exercise guides

Every exercise has a small **!** button (in the exercise picker, the workout card, the weekly program, Home and the calendar day view). Pressing it opens a box in the middle of the screen with numbered, step-by-step instructions and trainer tips, in English or Arabic depending on the app language. Close it with the X at the top right, the Esc key or by tapping outside.

The text lives in `lib/guides/`: each exercise is matched to a movement in `match.ts`, and the steps adapt to the equipment and variation (bench angle, one arm, cable height and so on). Exercises people add themselves are matched by name, then by muscle. `npm test` checks that all 592 built-in exercises have clean steps in both languages.

## Project map

```
app/                 Next.js App Router
  (app)/             signed-in screens: Home, Workout (+ /program), Food, Calendar, Progress, Settings (+ /goals)
  login/ reset/      auth screens
  manifest.ts        PWA manifest ("Bulkify")
components/ui/       design system (glass panels, bottom sheets, rings, toggles…)
components/features/ exercise picker, set logger, food search, charts…
lib/                 Supabase data layer, search, date / gym / nutrition math
  calculator.ts      calories & macros (pure, unit-tested)
  targets.ts         red → green target rules, good day / good month
  checkin.ts         the monthly weigh-in rule
tests/               unit tests (npm test)
messages/            en.json + ar.json (all UI text)
supabase/migrations/ SQL to run in the SQL editor
tools/               seed sources + generator (exercise list, Arabic food names)
scripts/make-icons   re-renders the Bulkify icons (npm run icons)
```

Tech: Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · Recharts · next-intl (full RTL) · Supabase (Postgres + Auth + RLS) · Netlify.
