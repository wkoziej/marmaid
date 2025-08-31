# 10. Deployment & Hosting
- **Frontend**: GitHub Pages (CI: build Vite → deploy).  
- **Supabase**: projekt w regionie UE, **Edge Functions** deployowane przez CLI, **Database Migrations** przez `supabase db`/SQL.  
- **Stripe**: klucze w **Edge Function secrets**, webhook endpoint publiczny (Supabase).  
- **Monitoring**: Supabase logs (DB/Functions), Stripe dashboard, Sentry (frontend).  

---
