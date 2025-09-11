# Epic 5: Deployment & Infrastructure

## Epic Goal

Establish robust, scalable deployment pipelines and infrastructure that enable secure, reliable delivery of Marmaid application to test and production environments with proper CI/CD automation, monitoring, and operational excellence.

## Epic Description

**Business Context:**
As Marmaid evolves from development to production, we need professional deployment infrastructure that ensures reliable service delivery, data protection, and seamless user experience. Therapists depend on consistent, secure access to their practice management tools, making robust infrastructure critical for business success.

**Technical Context:**
Building on our React + Supabase foundation (Epic 1), this epic establishes the deployment pipeline and infrastructure needed to deliver features from subsequent epics (Client Management, Therapy Planning) safely and reliably to end users. Our three-environment strategy includes:

- **Development Environment**: Local Docker Supabase + React dev server for rapid development
- **Test Environment**: GitHub Pages deployment from `test` branch + Supabase test project for validation
- **Production Environment**: GitHub Pages deployment from `main` branch + Supabase production project

**Environment Management:**
The project includes a unified CLI (`scripts/env`) for seamless environment switching, database migrations, and deployment workflows. This infrastructure supports the complete development lifecycle from local coding to production deployment.

**Success Criteria:**

- Test environment enables continuous validation of new features
- Production environment delivers reliable, secure service to therapists
- CI/CD pipeline automates deployment with quality gates and safety measures
- Environment management CLI streamlines development workflow
- Database migrations execute safely across all environments
- Infrastructure scales with user growth and feature expansion

## Stories

### 5.1 Test Environment Setup & CI/CD Pipeline

- **User Story:** _As a development team_, we need a dedicated test environment with automated deployment pipeline so that we can continuously validate features before production release.
- **Key Features:**
  - Supabase test project with isolated data (`myxicttnpflkwnofbhci.supabase.co`)
  - GitHub Pages deployment from `test` branch with automated CI/CD
  - Environment management CLI (`scripts/env`) for seamless switching
  - Automated database migration deployment and validation
  - Quality gates with comprehensive test execution (unit, integration, E2E)
  - Test data seeding and environment isolation

### 5.2 Production Infrastructure & Deployment

- **User Story:** _As a therapist user_, I need reliable, secure access to Marmaid application so that I can manage my practice without service disruptions or data concerns.
- **Key Features:**
  - Production Supabase project with security hardening (`aajurxtbngbixsdptfzz.supabase.co`)
  - GitHub Pages deployment from `main` branch with custom domain and SSL
  - Production database migration workflow with rollback capabilities
  - Environment management CLI for safe production operations
  - Production-grade monitoring and error tracking
  - Zero-downtime deployment strategy

### 5.3 Development Environment & Local Workflow

- **User Story:** _As a developer_, I need a complete local development environment so that I can efficiently develop and test features without external dependencies.
- **Key Features:**
  - Local Docker Supabase with complete database functionality
  - Environment management CLI for local setup and data management
  - Local migration testing and development workflow
  - Integrated development tools and debugging capabilities
  - Consistent local environment across team members

### 5.4 Security & Compliance Infrastructure

- **User Story:** _As a practice owner_, I need assurance that my client data is protected by enterprise-grade security so that I can confidently store sensitive therapy information.
- **Key Features:**
  - Environment-specific security configurations and access controls
  - Automated security scanning in CI/CD pipeline
  - Database encryption and secure migration procedures
  - Secrets management across all environments
  - Security incident response procedures and audit logging

## Acceptance Criteria

### Epic-Level Acceptance Criteria:

1. **Local Development**: Fully functional local Docker Supabase environment with complete development toolchain
2. **Test Environment**: GitHub Pages deployment from `test` branch with automated CI/CD pipeline and Supabase test project
3. **Production Environment**: GitHub Pages deployment from `main` branch delivering 99.9% uptime with sub-3-second response times
4. **Environment Management**: Unified CLI (`scripts/env`) enables seamless switching between environments with migration support
5. **Security Posture**: Infrastructure meets healthcare-adjacent security standards across all environments
6. **Deployment Safety**: CI/CD pipeline includes quality gates, automated testing, and safe migration procedures

## Technical Dependencies

- Epic 1 completion (Authentication & Foundation) - **PREREQUISITE**
- Docker and Docker Compose for local Supabase development
- GitHub Actions for CI/CD pipeline automation
- GitHub Pages for frontend hosting (test and production)
- Supabase Pro plan for production workloads (existing: `aajurxtbngbixsdptfzz.supabase.co`)
- Supabase test project (existing: `myxicttnpflkwnofbhci.supabase.co`)
- Domain registration and SSL certificate management (GitHub Pages integration)
- Environment management CLI scripts (existing: `scripts/env`)
- Database migration automation tooling

## Risks & Mitigation

- **Risk:** Production deployment issues could impact therapist users
- **Mitigation:** Blue-green deployments, comprehensive testing, gradual rollout strategy
- **Risk:** Security vulnerabilities in infrastructure could expose sensitive data
- **Mitigation:** Security scanning, compliance frameworks, regular security audits
- **Risk:** Infrastructure costs could escalate with user growth
- **Mitigation:** Resource monitoring, auto-scaling policies, cost optimization reviews

## Definition of Done

- [ ] Local development environment operational with Docker Supabase and environment CLI
- [ ] Test environment operational with automated CI/CD pipeline from `test` branch
- [ ] Production environment delivering reliable service with GitHub Pages deployment from `main` branch
- [ ] All four stories completed with acceptance criteria met (5.1-5.4)
- [ ] Environment management CLI (`scripts/env`) functional for all environments
- [ ] Database migration workflow tested and validated across all environments
- [ ] Security hardening implemented with environment-specific configurations
- [ ] CI/CD pipeline operational with quality gates and automated testing
- [ ] Documentation updated with complete workflow procedures
- [ ] Infrastructure cost optimization implemented for Supabase projects

## Story Sequencing & Dependencies

1. **5.3 Development Environment** - Foundation for local development workflow
2. **5.1 Test Environment** - Depends on 5.3, enables continuous validation
3. **5.2 Production Infrastructure** - Depends on 5.1 completion and validation
4. **5.4 Security & Compliance** - Final layer, implements security across all environments

## Development & Deployment Workflow

### Local Development Environment

```bash
# Setup local environment
npx supabase start                    # Start Docker Supabase
./scripts/env use local              # Configure local environment
cd frontend && npm run dev           # Start React development server
```

### Test Environment Deployment

```bash
# Development to test workflow
git checkout test                    # Switch to test branch
git merge develop                    # Merge latest changes
./scripts/env use test              # Switch to test environment
./scripts/env push test             # Deploy migrations to test
git push origin test                # Trigger GitHub Actions CI/CD
```

**Automated CI/CD Pipeline (GitHub Actions):**

1. **Quality Gates**: ESLint, TypeScript compilation, unit tests
2. **Integration Tests**: Execute comprehensive test suite
3. **Build Process**: Vite production build with test environment config
4. **Migration Deployment**: Automated database migration execution
5. **GitHub Pages Deployment**: Deploy to test environment
6. **Smoke Tests**: Validate deployment functionality

### Production Deployment

```bash
# Test to production workflow
git checkout main                   # Switch to main branch
git merge test                      # Merge validated changes
./scripts/env use prod              # Switch to production environment
./scripts/env push prod             # Deploy migrations to production
git push origin main                # Trigger production deployment
```

**Production Deployment Pipeline:**

1. **Final Quality Gates**: Complete test suite execution
2. **Security Scanning**: Automated vulnerability assessment
3. **Production Build**: Optimized build with production configuration
4. **Database Migration**: Safe migration deployment with rollback capability
5. **GitHub Pages Deployment**: Zero-downtime deployment to production
6. **Health Checks**: Post-deployment validation and monitoring

### Migration Management

```bash
# Create new migration
./scripts/env migrate "add_new_table"    # Create migration file
# Edit: supabase/migrations/TIMESTAMP_add_new_table.sql

# Test migration locally
npx supabase db reset                    # Reset local database
npx supabase start                       # Apply all migrations

# Deploy to test environment
./scripts/env use test                   # Switch to test
./scripts/env push test                  # Deploy to test database

# Deploy to production (after validation)
./scripts/env use prod                   # Switch to production
./scripts/env push prod                  # Deploy to production database
```

### Environment Management CLI Commands

```bash
# Environment switching
./scripts/env use local|test|prod        # Switch frontend configuration
./scripts/env status                     # Show current environment

# Database operations
./scripts/env link test|prod             # Link Supabase CLI to project
./scripts/env migrate "name"             # Create new migration
./scripts/env push test|prod             # Deploy migrations

# Validation and testing
./scripts/env test                       # Test environment connectivity
```

---

_Epic Owner: Product Owner (Sarah)_  
_Technical Lead: DevOps Engineer_  
_Priority: High (Foundation Infrastructure)_
