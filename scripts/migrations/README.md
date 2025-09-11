# Migracje Supabase - Standardy i Procedury

## Struktura folderów

```
scripts/migrations/
├── README.md                              # Ten dokument
└── rollbacks/                            # Plany rollback
    └── {timestamp}_rollback_{nazwa}.sql  # Plan rollback dla migracji
```

## Konwencja nazewnictwa

### Migracje (supabase/migrations/)

```
{YYYYMMDDHHMMSS}_{opis_migracji}.sql
```

**Przykład:** `20250901174855_create_therapists_table.sql`

### Plany rollback (scripts/migrations/rollbacks/)

```
{YYYYMMDDHHMMSS}_rollback_{nazwa_tabeli}.sql
```

**Przykład:** `20250901174855_rollback_therapists_table.sql`

## Procedura dodawania migracji

1. **Utworzenie migracji:**

   ```bash
   supabase migration new nazwa_migracji
   ```

2. **Edycja pliku migracji** w `supabase/migrations/`

3. **Utworzenie planu rollback** w `scripts/migrations/rollbacks/`

4. **Testowanie lokalnie:**

   ```bash
   supabase db reset
   supabase start
   ```

5. **Deploy na środowisko testowe:**
   ```bash
   ./scripts/use-test.sh
   supabase db push
   ```

## Standardy plików rollback

Każdy plan rollback powinien zawierać:

- Drop policies RLS w odwrotnej kolejności
- Drop indeksów
- Drop triggerów
- Drop tabel z CASCADE
- Komentarz o zachowaniu współdzielonych funkcji

## Bezpieczeństwo

- **Zawsze** tworzyć plan rollback przed migracją
- **Testować** rollback na środowisku dev
- **Używać** `IF EXISTS` dla bezpiecznego usuwania
- **Zachowywać** współdzielone funkcje (mogą być używane przez inne tabele)

## Historia migracji

| Timestamp      | Migracja                | Story | Status      |
| -------------- | ----------------------- | ----- | ----------- |
| 20250901174855 | create_therapists_table | 1.2   | ✅ Deployed |

## Kontakt

W przypadku problemów z migracjami skontaktuj się z @dev.mdc
