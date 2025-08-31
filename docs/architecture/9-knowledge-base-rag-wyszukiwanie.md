# 9. Knowledge Base / RAG / Wyszukiwanie
**Cel:** odpowiedź na pytania typu: _„ból X → które punkty i techniki wg danej szkoły?”_

**Warstwy:**
1. **KB (strukturalna)** – tabele: `points`, `schools`, `indications`, `contraindications`, relacje N:M (np. `point_indication`).  
2. **Full‑Text Search** – Postgres FTS (tsvector) po polach opisowych.  
3. **Vector Search (pgvector)** – embeddingi opisów punktów, wskazań, artykułów.  
4. **RAG Service (EF)** – funkcja Edge wykonuje: query → podobieństwo (pgvector) → pobranie kontekstu (DB) → _opcjonalnie_ wygenerowanie odpowiedzi (LLM) → zwrot do frontu.

**Pipeline embeddingów:**
- **Ingest**: dodanie/aktualizacja artykułu/punktu → EF tworzy embedding (OpenAI/Cohere/Voyage – konfigurowalne) → zapis do `kb_embeddings`.  
- **Czyszczenie danych**: brak PII; KB to wiedza fachowa, nie dane pacjentów.  

**UI wyszukiwarki:**  
- Pole wyszukiwania (słowa kluczowe + filtry: szkoła, obszar ciała).  
- Karta punktu: opis, wskazania, przeciwwskazania, wizualizacja (2D/3D), odnośniki.

---
