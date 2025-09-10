# Quality Gates System

Ten system zapewnia spójne sprawdzenia jakości kodu zarówno lokalnie jak i w CI/CD.

## 📋 Co sprawdzamy

### 1. **ESLint** - Jakość kodu i standardy
- Błędy składni i logiczne
- Nieużywane zmienne i importy  
- Standardy kodowania TypeScript/React
- Potential security issues

### 2. **TypeScript** - Sprawdzenie typów
- Błędy kompilacji TypeScript
- Niespójności typów
- Missing type definitions

### 3. **Testy** - Jakość i pokrycie
- **CI Mode**: Wszystkie testy (unit + integration)
- **Pre-commit Mode**: Tylko testy związane ze zmienionymi plikami

## 🚀 Jak używać

### Instalacja pre-commit hooks

```bash
# Zainstaluj hooks (jednorazowo)
npm run hooks:install

# Odinstaluj hooks (jeśli potrzebne)
npm run hooks:uninstall
```

### Konfiguracja środowiska testowego

**Dla integration testów potrzebujesz zmiennych środowiskowych:**

1. Skopiuj `.env.test` do `.env.test.local`:
```bash
cp .env.test .env.test.local
```

2. Lub uzyskaj dostęp do Supabase test environment:
   - `VITE_SUPABASE_URL` - URL testowego Supabase
   - `VITE_SUPABASE_ANON_KEY` - Anon key testowego Supabase

Bez tych zmiennych integration testy będą skipowane.

### Ręczne uruchamianie

```bash
# Wszystkie sprawdzenia (jak CI)
npm run quality-gates

# Tylko zmienione pliki (jak pre-commit)
npm run precommit
# lub
npm run quality-gates:pre-commit

# Poszczególne sprawdzenia
npm run lint
npm run typecheck
npm test -- --run
```

## ⚡ Pre-commit Mode vs CI Mode

### Pre-commit Mode (Szybki)
- ✅ Uruchamia się automatycznie przed commit
- ✅ Sprawdza tylko staged files
- ✅ Uruchamia tylko powiązane testy
- ✅ Szybki feedback (1-10 sekund)
- ❌ Nie uruchamia E2E testów

### CI Mode (Kompletny)
- ✅ Sprawdza wszystkie pliki
- ✅ Uruchamia wszystkie testy  
- ✅ Kompletna walidacja
- ✅ Uruchamia E2E testy
- ❌ Wolniejszy (1-5 minut)

## 🔧 Konfiguracja

### Wyłączenie pre-commit hooks

```bash
# Tymczasowo pomiń hooks
git commit --no-verify -m "message"

# Trwałe wyłączenie
npm run hooks:uninstall
```

### Dostosowanie sprawdzeń

Edytuj `scripts/quality-gates.js` aby:
- Dodać nowe sprawdzenia
- Zmienić strategie wykrywania testów
- Dostosować kolory i komunikaty

## 📁 Struktura plików

```
frontend/
├── .githooks/
│   └── pre-commit              # Git hook script
├── scripts/
│   └── quality-gates.js        # Główna logika sprawdzeń
├── docs/
│   └── QUALITY_GATES.md       # Ta dokumentacja
└── package.json               # NPM scripts
```

## 🐛 Rozwiązywanie problemów

### "node: not found"
```bash
# Zainstaluj Node.js lub upewnij się że jest w PATH
which node
node --version
```

### "Cannot find module"
```bash
# Zainstaluj dependencje
npm ci
```

### Hooks nie działają
```bash
# Sprawdź konfigurację git
git config core.hooksPath

# Reinstalacja hooks
npm run hooks:uninstall
npm run hooks:install

# Sprawdź uprawnienia
ls -la .githooks/pre-commit
chmod +x .githooks/pre-commit
```

### Zbyt wolne sprawdzenia
```bash
# Uruchom tylko podstawowe sprawdzenia
npm run lint
npm run typecheck

# Pomiń testy w pre-commit mode
git commit --no-verify -m "message"
```

## 🎯 Best Practices

### Dla developerów
1. **Instaluj hooks**: `npm run hooks:install` w każdym projekcie
2. **Testuj lokalnie**: `npm run precommit` przed push
3. **Nie pomijaj bez powodu**: `--no-verify` tylko w emergencjach
4. **Naprawiaj od razu**: Nie commituj ze złamanymi testami

### Dla zespołu
1. **Dokumentuj nowe sprawdzenia**: Aktualizuj tę dokumentację
2. **Optymalizuj czas**: Preferuj szybkie sprawdzenia w pre-commit
3. **Komunikuj zmiany**: Informuj zespół o zmianach w quality gates
4. **Monitoruj performance**: Sprawdzenia nie powinny trwać > 30s lokalnie

## 🔗 Integracje

### CI/CD GitHub Actions
- Używa tego samego scriptu: `npm run quality-gates`
- Uruchamia pełne sprawdzenia na każdym PR
- Blokuje merge jeśli sprawdzenia failują

### IDE Integration
```json
// .vscode/tasks.json
{
  "label": "Quality Gates",
  "type": "shell", 
  "command": "npm",
  "args": ["run", "precommit"],
  "group": "test"
}
```

### Package.json Scripts
- `quality-gates`: Pełne sprawdzenia (CI mode)
- `precommit`: Szybkie sprawdzenia (pre-commit mode)  
- `hooks:install`: Instalacja git hooks
- `hooks:uninstall`: Usunięcie git hooks

## 📊 Przykładowy output

### Pre-commit mode (szybki)
```bash
$ npm run precommit

🔍 Running Quality Gates (pre-commit mode)
📝 Checking 3 staged files:
  - src/features/clients/client-service.ts
  - src/features/clients/__tests__/client-service.test.ts
  - src/features/clients/client-schemas.ts

▶ Running ESLint
✅ Running ESLint ✓

▶ Running TypeScript type check  
✅ Running TypeScript type check ✓

🧪 Running tests for 1 test files
▶ Running related tests
✅ Running related tests ✓

📊 Quality Gates Summary:
  ✅ ESLint: Passed
  ✅ TypeCheck: Passed  
  ✅ Tests: Passed

🎉 All quality gates passed!
```

### CI mode (kompletny)
```bash
$ npm run quality-gates

🔍 Running Quality Gates (ci mode)

▶ Running ESLint
✅ Running ESLint ✓

▶ Running TypeScript type check
✅ Running TypeScript type check ✓

▶ Running unit tests
🧪 Test setup: Unit mode
🔧 Unit mode: All services mocked
✅ Running unit tests ✓

▶ Running integration tests  
🧪 Test setup: Integration mode
🌐 Integration mode: Using real Supabase when available
   Supabase URL: https://myxicttnpflkwnofbhci.supabase.co
✅ Running integration tests ✓

📊 Quality Gates Summary:
  ✅ ESLint: Passed
  ✅ TypeCheck: Passed
  ✅ Unit Tests: Passed
  ✅ Integration Tests: Passed

🎉 All quality gates passed!
```

## ✅ Status systemu

**System jest gotowy do produkcji!**

- ✅ Pre-commit hooks działają z quality gates
- ✅ Rozdzielenie unit/integration testów
- ✅ Automatyczne ładowanie zmiennych środowiskowych
- ✅ Inteligentne mockowanie (unit=pełne, integration=częściowe)
- ✅ Synchronizacja CI/CD z lokalnym workflow
- ✅ Smart test detection (tylko related tests w pre-commit)
- ✅ Kolorowe, czytelne raporty

**Testowane i działające komponenty:**
- 🔧 ESLint checks (regex fixes applied)
- 🔍 TypeScript validation  
- 🧪 Unit tests (86 passed, mocked services)
- 🌐 Integration tests (real Supabase environment)
- 🚀 Quality gates automation
- 🪝 Git pre-commit hooks