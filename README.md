# UeiDo — All-in-One Fitness App

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

**AI-powered fitness tracking with personalized plans, smart meal logging, and geo-based workout detection.**

[Live Demo](#) · [Report Bug](https://github.com/Srinjoy12/UeiDo-All-In-One-Fitness-App/issues) · [Request Feature](https://github.com/Srinjoy12/UeiDo-All-In-One-Fitness-App/issues)

</div>

---

## ✨ Highlights

- **AI-Generated Plans** — Personalized 7-day workout & diet plans using Groq AI (Llama 3.3 70B), tailored to goals, experience, and activity level
- **Vision-Powered Meal Logging** — Snap a photo of your food; AI estimates calories, protein, carbs, and logs it automatically
- **Geo-Location Workout Tracking** — Gym visits auto-logged when you're within 100m of your gym for 15 minutes
- **Indian-First Design** — Diet plans with Indian cuisine, regional preferences, and local gym search
- **Full-Stack Production App** — Auth, database, edge functions, RLS, and responsive UI

---

## 🚀 Features

| Feature | Description |
|--------|-------------|
| **Personalized Plans** | AI generates unique gym & home workouts (7 days) + 7-day Indian diet based on profile & questionnaire |
| **Meal Photo Analysis** | Camera capture → Groq Vision AI → instant nutritional estimate → auto-log to daily intake |
| **Geo-Tracking** | Set gym location on map; workouts auto-complete when you're at the gym (manual option retained) |
| **Dashboard** | Today's workout, calorie intake vs target, BMI, weekly streak, quick links |
| **Workouts** | Gym & home tabs, day selector, exercise lists, manual/auto completion |
| **Diet** | 7-day AI-generated Indian meal plan with calorie targets |
| **Settings** | Light/dark theme, gym location picker (map + search), geo-tracking toggle |
| **Reminders** | Configurable workout & meal reminders |
| **Motivation** | Daily quotes and progress insights |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS, React Router 7, Zustand |
| **Backend** | Supabase (Auth, PostgreSQL, Row Level Security) |
| **AI** | Groq (Llama 3.3 70B for plans, Vision for meal analysis) |
| **Maps** | Leaflet, React-Leaflet, Photon (geocoding) |
| **Deploy** | Netlify / Vercel ready |

---

## 📁 Project Structure

```
├── src/
│   ├── components/     # Layout, ProtectedRoute, ErrorBoundary, SetupRequired
│   ├── hooks/          # usePlan, useMealLogs, useGeoTracking, useTheme, useProfile, ...
│   ├── pages/          # Dashboard, Workouts, Diet, MealPhoto, Settings, BMI, ...
│   ├── providers/       # AuthProvider
│   ├── store/          # Zustand (profile, theme, geo-tracking)
│   ├── lib/             # supabaseClient, bmi, authErrors, database types
│   └── data/            # Static fallbacks, workout images
├── supabase/
│   ├── functions/      # generate-plan, analyze-meal, nominatim-search (Edge Functions)
│   └── migrations/     # Schema (profiles, plans, workout_logs, meal_logs, reminders)
├── public/
├── vercel.json         # Vercel config
├── netlify.toml        # Netlify config
└── DEPLOY.md           # Deployment guide
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React SPA (Vite)                          │
│  Dashboard │ Workouts │ Diet │ Meal Photo │ BMI │ Settings       │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌─────────────────┐   ┌──────────────────┐
│  Supabase     │   │  Edge Functions │   │  Photon API       │
│  Auth + DB    │   │  (Groq AI)       │   │  (Geocoding)      │
│  RLS enforced │   │  generate-plan   │   │  Gym search       │
│               │   │  analyze-meal     │   └──────────────────┘
└───────────────┘   └─────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- Supabase project
- Groq API key (for AI features)

### 1. Clone & Install

```bash
git clone https://github.com/Srinjoy12/UeiDo-All-In-One-Fitness-App.git
cd UeiDo-All-In-One-Fitness-App
npm install
```

### 2. Environment

Copy `.env.example` to `.env.local` and set:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Supabase Setup

- **Auth** → Disable email confirmation (or configure redirect URLs)
- **Edge Functions** → Add secret `GROQ_API_KEY` in Dashboard → Project Settings → Edge Functions → Secrets
- **Database** → Run migrations: `npx supabase db push` (or apply SQL manually)

### 4. Deploy Edge Functions

```bash
npx supabase functions deploy generate-plan
npx supabase functions deploy analyze-meal
npx supabase functions deploy nominatim-search
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 📦 Build & Deploy

```bash
npm run build
```

Static output in `dist/`. Deploy to [Netlify](https://netlify.com) or [Vercel](https://vercel.com) — see [DEPLOY.md](./DEPLOY.md) for details.

---

## 📄 License

MIT

---

<div align="center">

**Built with React, TypeScript, Supabase & Groq AI**

</div>
