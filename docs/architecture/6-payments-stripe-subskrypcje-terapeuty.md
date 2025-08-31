# 6. Payments — Stripe (subskrypcje terapeuty)
**Dlaczego Edge Functions?** Frontend (GitHub Pages) nie może trzymać sekretów Stripe. Logika płatności idzie przez **Supabase Edge Functions** (Deno):

**Flow (Mermaid):**
```mermaid
sequenceDiagram
  participant U as Therapist (Frontend)
  participant EF as Supabase Edge Function (Stripe)
  participant S as Stripe
  participant DB as Supabase (DB)

  U->>EF: POST /create-checkout-session
  EF->>S: Create Checkout Session (secret)
  S-->>U: url (redirect)
  U->>S: Pay (Checkout)
  S-->>EF: webhook: checkout.completed
  EF->>DB: update therapist.subscription_status = active
  EF-->>U: (optional) redirect to success
```

**Elementy:**
- **Create Checkout** (EF): tworzy sesję, zapisuje `stripe_customer_id`.  
- **Webhook** (EF): aktualizuje status subskrypcji, obsługuje odnowienia/anulacje.  
- **Guard w UI**: feature gating (np. dostęp do KB/RAG tylko dla aktywnej subskrypcji).

---
