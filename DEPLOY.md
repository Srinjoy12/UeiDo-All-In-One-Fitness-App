# Deploy UeiDo

## Prerequisites

- Code pushed to **GitHub**, **GitLab**, or **Bitbucket**
- Supabase project set up (auth, database, edge functions)
- Supabase URL and anon key ready

---

## Option 1: Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Import your repo. Vercel will detect Vite.
4. Add **Environment Variables**:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon (public) key
5. Click **Deploy**.

Your app will be live at `https://your-project.vercel.app`.

---

## Option 2: Netlify

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub.
2. Click **Add new site** → **Import an existing project**.
3. Connect your repo. Netlify will use `netlify.toml`.
4. Add **Environment Variables** (Site settings → Environment variables):
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Deploy.

---

## Supabase configuration

1. **Auth → URL Configuration**  
   Add your production URL to **Site URL** and **Redirect URLs**:
   - `https://your-app.vercel.app` (or your Netlify URL)
   - `https://your-app.vercel.app/**` for redirects

2. **Edge Functions**  
   Ensure `generate-plan`, `analyze-meal`, and `nominatim-search` are deployed:
   ```bash
   npx supabase functions deploy generate-plan
   npx supabase functions deploy analyze-meal
   npx supabase functions deploy nominatim-search
   ```

3. **Secrets**  
   In Supabase Dashboard → Project Settings → Edge Functions → Secrets, set:
   - `GROQ_API_KEY` (for AI features)

---

## Manual deploy (static hosting)

If you host on any static host (e.g. GitHub Pages, Cloudflare Pages):

1. Run `npm run build`.
2. Upload the contents of the `dist/` folder.
3. Configure the host so all routes serve `index.html` (SPA routing).
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the build environment.
