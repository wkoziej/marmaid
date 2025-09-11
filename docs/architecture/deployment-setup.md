# 🚀 Marmaid Deployment Setup Guide

## ✅ Co Już Mamy

- ✅ Test repository: https://github.com/wkoziej/marmaid-test
- ✅ Production repository: https://github.com/wkoziej/marmaid
- ✅ Multi-environment CI/CD workflow
- ✅ Monitoring and rollback procedures
- ✅ Environment management CLI

## 🔧 Kroki do Finalizacji

### 1. GitHub Personal Access Token

**Potrzebne do deployment na test repo:**

1. Idź do: https://github.com/settings/tokens/new
2. Token name: `Marmaid Deployment`
3. Expiration: `90 days` (lub więcej)
4. Scopes: ☑️ `repo`, ☑️ `workflow`
5. Generate token i **skopiuj go**

### 2. Dodaj Token do Repository Secrets

1. Idź do: https://github.com/wkoziej/marmaid/settings/secrets/actions
2. `New repository secret`
3. Name: `DEPLOY_TOKEN`
4. Value: **paste token here**
5. Add secret

### 3. Aktywuj GitHub Pages dla Test Repo

1. Idź do: https://github.com/wkoziej/marmaid-test/settings/pages
2. Source: `Deploy from a branch`
3. Branch: `main`
4. Folder: `/ (root)`
5. Save

### 4. Aktualizuj Workflow (używa token)

```yaml
# W .github/workflows/multi-env-deploy.yml
- name: Deploy to test repository
  env:
    GITHUB_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
  run: |
    git clone https://$GITHUB_TOKEN@github.com/wkoziej/marmaid-test.git temp-test-repo
    # ... rest of deployment
```

## 🚀 Test Deployment

Po setup:

```bash
git checkout test
git commit --allow-empty -m "test: trigger deployment"
git push origin test
```

Sprawdź:

- GitHub Actions: https://github.com/wkoziej/marmaid/actions
- Test site: https://test.marmaid.pl/ (po ~5 min)

## 📊 Production Deployment

```bash
git checkout main
git merge test
git push origin main
```

Sprawdź:

- Production: https://marmaid.pl/

## 🔧 Daily Usage

```bash
# Switch environments
./scripts/env use test|prod|local

# Health monitoring
./scripts/env health
./scripts/env monitor

# Emergency rollback
./scripts/env rollback frontend test
./scripts/env rollback frontend prod --backup-first
```

## 🎯 URLs Summary

- **Test:** https://test.marmaid.pl/
- **Production:** https://marmaid.pl/
- **Source Repo:** https://github.com/wkoziej/marmaid
- **Test Repo:** https://github.com/wkoziej/marmaid-test

---

_Po wykonaniu kroków 1-3, deployment workflow będzie w pełni funkcjonalny!_
