# 4. Backend & Database (Supabase)

## 4.1 Model danych (propozycja MVP)

- **users** (id, email, role: `therapist`|`client`, stripe_customer_id, created_at)
- **therapists** (id -> users.id, profile, subscription_status)
- **clients** (id, therapist_id, name, contact, intake_id?)
- **intakes** (id, client_id, payload_json, created_at)
- **sessions** (id, client_id, date, notes, effectiveness_rating, next_try_json)
- **schools** (id, name, description)
- **points** (id, school_id, code, name, location_text, contraindications, indications, synonyms)
- **point_geometry** (point_id, type: `2d`|`3d`, coords, model_ref)
- **session_points** (session_id, point_id, technique, result_note)
- **kb_articles** (id, title, body_md, tags[])
- **kb_embeddings** (kb_id, embedding vector) — **pgvector**

> Uwaga: dane PII pacjentów ograniczamy do minimum. Dane zdrowotne w MVP nie wymagają certyfikacji, ale należy uwzględnić RODO.

## 4.2 API

- Dostęp przez **PostgREST** (Supabase) – CRUD na tabelach z politykami RLS.
- **Edge Functions** dla: Stripe (checkout, webhooks), importy KB, generowanie/odświeżanie embeddingów, ewentualny endpoint RAG.

## 4.3 RLS (Row-Level Security)

- **therapist**: pełny dostęp tylko do własnych rekordów (clients, sessions, intakes, session_points).
- **client**: dostęp tylko do _własnego_ intake i ewentualnego portalu (read-only).
- **public**: brak dostępu do danych wrażliwych.
- Polityki RLS muszą wiązać rekordy z `auth.uid()`.

---
