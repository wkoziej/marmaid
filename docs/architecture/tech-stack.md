# Tech Stack — Marmaid

## Wybór technologii dla MVP

| Obszar           | Wybór                                                                           | Uzasadnienie                                     |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| Budowanie frontu | **Vite + React 18**                                                             | Szybkie dev/build, ekosystem React               |
| UI               | **TailwindCSS** + **shadcn/ui**                                                 | Szybkie, spójne komponenty i styl                |
| Routing          | **React Router**                                                                | Standard SPA                                     |
| Data fetching    | **TanStack Query**                                                              | Cache, synchronizacja z Supabase                 |
| Stan UI          | **Zustand** (lekki)                                                             | Lokalny stan bez Redux                           |
| Formularze       | **React Hook Form** + **Zod**                                                   | Walidacja, DX                                    |
| Auth & DB        | **@supabase/supabase-js** + **@supabase/auth-ui-react** (opcjonalnie)           | Rejestracja, logowanie, reset hasła, operacje DB |
| Wizualizacja 3D  | **three.js** + **react-three-fiber** + **drei**                                 | Sceny 3D, łatwa integracja z React               |
| Wizualizacja 2D  | **SVG** + **react-svg-pan-zoom**                                                | Pan/zoom, adnotacje punktów                      |
| Płatności        | **@stripe/stripe-js** (frontend) + **Stripe SDK (Edge Function)**               | Checkout i webhooks                              |
| E-mail           | **Supabase Auth emails** / (opcjonalnie) **Resend/Mailgun** przez Edge Function | Reset hasła, powiadomienia                       |
| RAG / Embeddings | **pgvector** (Supabase) + **OpenAI/Cohere/Voyage** (pluggable)                  | Wektoryzacja treści i podobieństwo               |

## Kluczowe pakiety NPM

### Core Dependencies

- `react` ^18.0.0
- `react-dom` ^18.0.0
- `@vitejs/plugin-react`
- `vite`
- `typescript`

### UI & Styling

- `tailwindcss`
- `@radix-ui/react-*` (shadcn/ui dependencies)
- `lucide-react` (ikony)
- `class-variance-authority` (CV patterns)

### Routing & State

- `react-router-dom`
- `zustand`
- `@tanstack/react-query`

### Forms & Validation

- `react-hook-form`
- `zod`
- `@hookform/resolvers`

### Backend Integration

- `@supabase/supabase-js`
- `@supabase/auth-ui-react`

### Wizualizacja

- `three` + `@types/three`
- `@react-three/fiber`
- `@react-three/drei`
- `react-svg-pan-zoom`

### Płatności

- `@stripe/stripe-js`

## Wersje środowiska

- **Node.js**: >=18.0.0
- **NPM**: >=9.0.0
- **TypeScript**: ^5.0.0
- **Vite**: ^5.0.0

## Backend Stack (Supabase)

- **Database**: PostgreSQL + pgvector
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions (Deno)
- **Real-time**: Supabase Realtime
