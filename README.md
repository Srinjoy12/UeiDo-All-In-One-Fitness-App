# UeiDo — All-in-One Fitness

React + TypeScript + Vite app with Supabase auth, per-user plans, and AI-generated workouts/diet via Groq AI.

## Environment

1. **Supabase Auth** – For signup → questionnaire → dashboard flow, disable email confirmation:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Providers** → **Email**
   - Turn **OFF** "Confirm email"
   - Users will get a session immediately after signup and can complete onboarding without checking email

2. **Frontend env** – Copy `.env.example` to `.env.local` and set:
   - `VITE_SUPABASE_URL` – your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` – your Supabase anon (publishable) key

2. **Groq AI (Edge Function)** – The app calls the `generate-plan` Edge Function to create personalized plans. The Groq API key must **never** go in the frontend. Set it in Supabase:
   - **Production**: [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **Edge Functions** → **Secrets** → add `GROQ_API_KEY` with your Groq API key.
   - **Local** (when using `supabase functions serve`): add `GROQ_API_KEY=your_key` to a `.env` file in the project root or in `supabase/.env`.

Get a Groq API key at [console.groq.com](https://console.groq.com/keys).

### Edge Function 401 fix

If "Create my plan" returns 401 Unauthorized, redeploy the Edge Function with JWT verification disabled (the function validates the token itself):

```bash
supabase functions deploy generate-plan
```

The `supabase/config.toml` has `verify_jwt = false` for `generate-plan`. Ensure `GROQ_API_KEY` is set in Supabase Dashboard → Project Settings → Edge Functions → Secrets.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
