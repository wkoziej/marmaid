# 1. System Overview / Context
**Marmaid** to aplikacja webowa dla terapeutów punktów marma. Architektura jest lekka (frontend statyczny + BaaS) z możliwością rozbudowy. Główne komponenty:

- **Frontend (React, GitHub Pages)** – UI terapeuty, formularz intake, wizualizacja punktów marma (2D/3D).  
- **Backend / Data** – **Supabase** (Postgres + Auth + Realtime + Edge Functions).  
- **Płatności** – **Stripe** (Checkout + Webhooks) obsługiwane przez Supabase Edge Functions.  
- **Wizualizacja punktów** – moduł 2D (SVG) i/lub 3D (Three.js) z danymi anatomicznymi i mapą punktów.  
- **Knowledge Base / RAG** – baza wiedzy o punktach marma (Postgres + pgvector) + wektorowy indeks wskazań/przeciwwskazań + pipeline embeddingów.  

Komunikacja: frontend łączy się bezpośrednio z Supabase (SDK) dla Auth/DB oraz wywołuje **Edge Functions** dla operacji wymagających sekretów (Stripe, RAG-inference, importy danych).

---
