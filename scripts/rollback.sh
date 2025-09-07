#!/bin/bash
# ABOUTME: Rollback script for deployment emergencies
# ABOUTME: Handles rollback of deployments, database migrations, and configurations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo "🔄 Marmaid Rollback & Recovery Tool"
    echo ""
    echo "Usage: ./scripts/rollback.sh <command> [options]"
    echo ""
    echo "Rollback Commands:"
    echo "  frontend test     Rollback test frontend deployment"
    echo "  frontend prod     Rollback production frontend deployment (DANGER!)"
    echo "  database test     Rollback test database to previous migration"
    echo "  database prod     Rollback production database (EXTREME DANGER!)"
    echo "  full test         Full rollback of test environment"
    echo "  full prod         Full rollback of production environment"
    echo ""
    echo "Recovery Commands:"
    echo "  status            Show rollback status and available restore points"
    echo "  backup            Create emergency backup before rollback"
    echo "  verify            Verify system state after rollback"
    echo ""
    echo "Safety Features:"
    echo "  --dry-run         Show what would be done without executing"
    echo "  --confirm         Skip confirmation prompts (for automation)"
    echo "  --backup-first    Automatically backup before rollback"
    echo ""
    echo "Examples:"
    echo "  ./scripts/rollback.sh status"
    echo "  ./scripts/rollback.sh frontend test --dry-run"
    echo "  ./scripts/rollback.sh full prod --backup-first --confirm"
    echo ""
}

confirm_action() {
    local message="$1"
    local danger_level="${2:-normal}"
    
    if [[ "${SKIP_CONFIRM:-}" == "true" ]]; then
        echo -e "${YELLOW}⚠️  Auto-confirming: $message${NC}"
        return 0
    fi
    
    case $danger_level in
        "extreme")
            echo -e "${RED}🚨 EXTREME DANGER: $message${NC}"
            echo -e "${RED}This action affects PRODUCTION and could cause DATA LOSS!${NC}"
            echo -e "${RED}Type 'I UNDERSTAND THE RISKS' to continue:${NC}"
            read -r response
            if [[ "$response" != "I UNDERSTAND THE RISKS" ]]; then
                echo -e "${RED}❌ Rollback cancelled for safety${NC}"
                exit 1
            fi
            ;;
        "high")
            echo -e "${YELLOW}⚠️  HIGH RISK: $message${NC}"
            echo -e "${YELLOW}This action affects production systems. Type 'yes' to continue:${NC}"
            read -r response
            if [[ "$response" != "yes" ]]; then
                echo -e "${YELLOW}❌ Rollback cancelled${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${BLUE}📋 $message${NC}"
            echo -e "${BLUE}Continue? (y/N):${NC}"
            read -r response
            if [[ "$response" != "y" && "$response" != "Y" ]]; then
                echo -e "${BLUE}❌ Rollback cancelled${NC}"
                exit 1
            fi
            ;;
    esac
}

show_status() {
    echo -e "${BLUE}🔍 ROLLBACK STATUS & RESTORE POINTS${NC}"
    echo "==========================================="
    echo ""
    echo "Git Repository Status:"
    echo "Current branch: $(git branch --show-current)"
    echo "Latest commits:"
    git log --oneline -5
    echo ""
    
    echo "GitHub Actions Status:"
    echo "Check: https://github.com/$(git remote get-url origin | sed 's/.*github\.com[:/]//' | sed 's/\.git$//')/actions"
    echo ""
    
    echo "Available Restore Points:"
    echo "- Frontend: Previous GitHub Pages deployment (automatic)"
    echo "- Database: Previous migration state (manual rollback required)"
    echo "- Configuration: Git history (revert commits)"
    echo ""
    
    echo "Recovery Commands Available:"
    echo "- Frontend rollback: Revert to previous working commit"
    echo "- Database rollback: Migrate down to previous state"
    echo "- Full environment rollback: Complete restoration"
}

rollback_frontend() {
    local environment="$1"
    local dry_run="${2:-false}"
    
    case $environment in
        "test")
            confirm_action "Rollback test frontend to previous working state"
            branch="test"
            target_repo="https://github.com/wkoziej/marmaid-test.git"
            target_url="https://test.marmaid.pl/"
            danger="normal"
            ;;
        "prod")
            confirm_action "Rollback production frontend deployment" "high"
            branch="main"
            target_repo="https://github.com/wkoziej/marmaid.git"
            target_url="https://marmaid.pl/"
            danger="high"
            ;;
        *)
            echo -e "${RED}❌ Invalid environment: $environment${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${BLUE}🔄 Starting frontend rollback for $environment...${NC}"
    
    if [[ "$dry_run" == "true" ]]; then
        echo -e "${YELLOW}[DRY RUN] Would execute:${NC}"
        echo "1. git checkout $branch"
        echo "2. git reset --hard HEAD~1"
        echo "3. git push --force-with-lease origin $branch"
        echo "4. Wait for GitHub Actions deployment"
        return
    fi
    
    # Get current commit for potential restore
    local current_commit=$(git rev-parse HEAD)
    echo "Current commit: $current_commit (saving for potential restore)"
    
    # Switch to appropriate branch
    git checkout "$branch"
    
    # Find last working commit (look for successful deployment commits)
    local last_good_commit
    last_good_commit=$(git log --oneline --grep="feat:\|fix:\|deployment" -1 --format="%H" HEAD~1)
    
    if [[ -z "$last_good_commit" ]]; then
        echo -e "${YELLOW}⚠️  Could not find obvious last good commit. Using HEAD~1${NC}"
        last_good_commit="HEAD~1"
    fi
    
    echo "Rolling back to: $last_good_commit"
    
    # Reset to last good state
    git reset --hard "$last_good_commit"
    
    # Force push (with safety check)
    echo -e "${YELLOW}⚠️  Force pushing to trigger rollback deployment...${NC}"
    git push --force-with-lease origin "$branch"
    
    echo -e "${GREEN}✅ Frontend rollback initiated${NC}"
    echo "Monitor deployment at: https://github.com/$(git remote get-url origin | sed 's/.*github\.com[:/]//' | sed 's/\.git$//')/actions"
    echo ""
    echo "To restore forward if needed:"
    echo "  git reset --hard $current_commit"
    echo "  git push --force-with-lease origin $branch"
}

rollback_database() {
    local environment="$1"
    local dry_run="${2:-false}"
    
    case $environment in
        "test")
            confirm_action "Rollback test database to previous migration"
            ;;
        "prod")
            confirm_action "Rollback production database migration" "extreme"
            ;;
        *)
            echo -e "${RED}❌ Invalid environment: $environment${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${BLUE}🗄️  Starting database rollback for $environment...${NC}"
    
    # Switch to appropriate environment
    "$SCRIPT_DIR/env" use "$environment"
    
    if [[ "$dry_run" == "true" ]]; then
        echo -e "${YELLOW}[DRY RUN] Would execute:${NC}"
        echo "1. List recent migrations"
        echo "2. Identify last migration to rollback"
        echo "3. Execute migration rollback"
        echo "4. Verify database state"
        return
    fi
    
    echo "Recent migrations:"
    ls -la supabase/migrations/ | tail -5
    echo ""
    
    echo "⚠️  Database rollback requires manual intervention."
    echo "Steps to perform manually:"
    echo "1. Identify the migration to rollback from the list above"
    echo "2. Create a rollback migration:"
    echo "   npx supabase migration new 'rollback_problematic_migration'"
    echo "3. Edit the generated migration file to undo changes"
    echo "4. Deploy rollback migration:"
    echo "   ./scripts/env push $environment"
    
    echo ""
    echo -e "${YELLOW}⚠️  Automatic database rollback not implemented for safety.${NC}"
    echo "Manual rollback required to prevent data loss."
}

rollback_full() {
    local environment="$1"
    local dry_run="${2:-false}"
    
    case $environment in
        "test")
            confirm_action "Full rollback of test environment (frontend + database)"
            ;;
        "prod")
            confirm_action "Full rollback of production environment" "extreme"
            ;;
        *)
            echo -e "${RED}❌ Invalid environment: $environment${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${BLUE}🔄 Starting full environment rollback for $environment...${NC}"
    
    if [[ "$dry_run" == "true" ]]; then
        echo -e "${YELLOW}[DRY RUN] Would execute:${NC}"
        echo "1. Rollback frontend deployment"
        echo "2. Rollback database migrations"
        echo "3. Verify environment health"
        return
    fi
    
    # Rollback frontend first
    rollback_frontend "$environment" "false"
    
    echo ""
    echo "Waiting 30 seconds for frontend rollback to deploy..."
    sleep 30
    
    # Then handle database
    rollback_database "$environment" "false"
    
    echo ""
    echo -e "${GREEN}✅ Full environment rollback completed${NC}"
    echo "Run health check to verify: ./scripts/env health"
}

create_backup() {
    echo -e "${BLUE}💾 Creating emergency backup...${NC}"
    
    local backup_branch="backup-$(date +%Y%m%d-%H%M%S)"
    
    # Create backup branch
    git checkout -b "$backup_branch"
    git push -u origin "$backup_branch"
    
    echo -e "${GREEN}✅ Backup created: $backup_branch${NC}"
    echo "To restore from backup: git checkout $backup_branch"
    
    # Return to original branch
    git checkout -
}

verify_rollback() {
    echo -e "${BLUE}🔍 Verifying system state after rollback...${NC}"
    
    # Run health check
    "$SCRIPT_DIR/health-check.sh"
    
    echo ""
    echo "Manual verification checklist:"
    echo "□ Frontend loads correctly"
    echo "□ Authentication works"
    echo "□ Database connections successful"
    echo "□ No JavaScript errors in console"
    echo "□ All critical features functional"
    echo ""
    echo "If any issues found, consider additional rollback steps."
}

# Parse command line arguments
DRY_RUN=false
SKIP_CONFIRM=false
BACKUP_FIRST=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --confirm)
            SKIP_CONFIRM=true
            shift
            ;;
        --backup-first)
            BACKUP_FIRST=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            break
            ;;
    esac
done

# Create backup if requested
if [[ "$BACKUP_FIRST" == "true" ]]; then
    create_backup
fi

# Main command execution
case "${1:-}" in
    "frontend")
        rollback_frontend "${2:-}" "$DRY_RUN"
        ;;
    "database")
        rollback_database "${2:-}" "$DRY_RUN"
        ;;
    "full")
        rollback_full "${2:-}" "$DRY_RUN"
        ;;
    "status")
        show_status
        ;;
    "backup")
        create_backup
        ;;
    "verify")
        verify_rollback
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac