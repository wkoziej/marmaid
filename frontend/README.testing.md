# Testing Guide

## Environment Setup

### Local Development

Testy wymagają połączenia z prawdziwą instancją Supabase. Stwórz plik `.env.test.local`:

```bash
# frontend/.env.test.local (nie commituj tego pliku!)
VITE_SUPABASE_URL=https://twoja-instancja.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI...
```

**WAŻNE:** Plik `.env.test.local` jest automatycznie ignorowany przez git.

### CI/CD (GitHub Actions)

Testy w CI używają GitHub Secrets. Ustaw następujące sekrety w repozytorium:

1. Idź do: `Settings` → `Secrets and variables` → `Actions`
2. Dodaj sekrety:
   - `TEST_SUPABASE_URL` - URL instancji testowej Supabase
   - `TEST_SUPABASE_ANON_KEY` - Klucz publiczny (anon) dla testów

## Rodzaje testów

### Unit Tests
```bash
npm run test:unit
```
Szybkie testy jednostkowe bez integracji z Supabase.

### Integration Tests  
```bash
npm run test:integration
```
Testy RLS, auth, itp. wymagające połączenia z Supabase.

### E2E Tests
```bash  
npm run test:e2e
```
Testy end-to-end z Playwright.

## Bezpieczeństwo

- **NIGDY** nie commituj kluczy API do kodu
- Używaj `.env.test.local` dla lokalnych testów
- Używaj GitHub Secrets dla CI/CD
- Instancja testowa powinna być oddzielna od produkcyjnej

## Troubleshooting

### Testy są pomijane
Sprawdź czy masz ustawione zmienne środowiskowe:
```bash
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### RLS testy nie działają
1. Sprawdź czy tabele istnieją w bazie testowej
2. Uruchom migracje Supabase na instancji testowej
3. Sprawdź czy RLS jest włączone na tabelach