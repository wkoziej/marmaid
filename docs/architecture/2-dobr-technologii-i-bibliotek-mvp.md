# 2. Dobór technologii i bibliotek (MVP)

| Obszar | Wybór | Uzasadnienie |
|---|---|---|
| Budowanie frontu | **Vite + React 18** | Szybkie dev/build, ekosystem React |
| UI | **TailwindCSS** + **shadcn/ui** | Szybkie, spójne komponenty i styl |
| Routing | **React Router** | Standard SPA |
| Data fetching | **TanStack Query** | Cache, synchronizacja z Supabase |
| Stan UI | **Zustand** (lekki) | Lokalny stan bez Redux |
| Formularze | **React Hook Form** + **Zod** | Walidacja, DX |
| Auth & DB | **@supabase/supabase-js** + **@supabase/auth-ui-react** (opcjonalnie) | Rejestracja, logowanie, reset hasła, operacje DB |
| Wizualizacja 3D | **three.js** + **react-three-fiber** + **drei** | Sceny 3D, łatwa integracja z React |
| Wizualizacja 2D | **SVG** + **react-svg-pan-zoom** | Pan/zoom, adnotacje punktów |
| Płatności | **@stripe/stripe-js** (frontend) + **Stripe SDK (Edge Function)** | Checkout i webhooks |
| E-mail | **Supabase Auth emails** / (opcjonalnie) **Resend/Mailgun** przez Edge Function | Reset hasła, powiadomienia |
| RAG / Embeddings | **pgvector** (Supabase) + **OpenAI/Cohere/Voyage** (pluggable) | Wektoryzacja treści i podobieństwo |

---
