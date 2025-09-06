#!/usr/bin/env node
// ABOUTME: Quality gates script for CI/CD and pre-commit hooks
// ABOUTME: Runs linting, type checking, and tests with smart file filtering

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env files
function loadEnvFiles() {
  const envFiles = ['.env.test.local', '.env.local', '.env'];
  
  for (const file of envFiles) {
    const filePath = resolve(file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
        if (match) {
          const [, key, value] = match;
          // Only set if not already set
          if (!process.env[key]) {
            process.env[key] = value.replace(/^["']|["']$/g, '');
          }
        }
      });
    }
  }
}

// Load environment variables at startup
loadEnvFiles();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(message) {
  log(`\n${colors.blue}▶ ${message}${colors.reset}`, colors.bold);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

// Execute command and handle output
function executeCommand(command, description, options = {}) {
  try {
    logStep(description);
    const result = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: process.cwd(),
      encoding: 'utf8',
      ...options
    });
    logSuccess(`${description} ✓`);
    return { success: true, output: result };
  } catch (error) {
    logError(`${description} failed`);
    if (options.silent && error.stdout) {
      console.log(error.stdout);
    }
    if (options.silent && error.stderr) {
      console.error(error.stderr);
    }
    return { success: false, error };
  }
}

// Get changed files for pre-commit mode
function getChangedFiles() {
  try {
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    
    if (!stagedFiles) return [];
    
    return stagedFiles
      .split('\n')
      .filter(file => file.match(/\.(ts|tsx|js|jsx)$/))
      .filter(file => existsSync(file))
      .map(file => resolve(file));
  } catch {
    return [];
  }
}

// Get test files related to changed files
function getRelatedTestFiles(changedFiles) {
  const testFiles = [];
  
  changedFiles.forEach(file => {
    // Direct test files
    if (file.includes('__tests__/') || file.includes('.test.') || file.includes('.spec.')) {
      testFiles.push(file);
      return;
    }
    
    // Find related test files
    const baseName = file.replace(/\.(ts|tsx|js|jsx)$/, '');
    const dir = file.split('/').slice(0, -1).join('/');
    
    // Look for test files in same directory or __tests__ subdirectory
    const possibleTestFiles = [
      `${baseName}.test.ts`,
      `${baseName}.test.tsx`,
      `${baseName}.spec.ts`,
      `${baseName}.spec.tsx`,
      `${dir}/__tests__/${file.split('/').pop().replace(/\.(ts|tsx|js|jsx)$/, '')}.test.ts`,
      `${dir}/__tests__/${file.split('/').pop().replace(/\.(ts|tsx|js|jsx)$/, '')}.test.tsx`
    ];
    
    possibleTestFiles.forEach(testFile => {
      if (existsSync(testFile)) {
        testFiles.push(resolve(testFile));
      }
    });
  });
  
  return [...new Set(testFiles)]; // Remove duplicates
}

// Main quality gate checks
async function runQualityGates(mode = 'ci') {
  log(`${colors.bold}🔍 Running Quality Gates (${mode} mode)${colors.reset}`);
  
  const isPreCommit = mode === 'pre-commit';
  const changedFiles = isPreCommit ? getChangedFiles() : [];
  
  if (isPreCommit && changedFiles.length === 0) {
    logWarning('No staged files to check');
    return true;
  }
  
  if (isPreCommit) {
    log(`📝 Checking ${changedFiles.length} staged files:`, colors.blue);
    changedFiles.forEach(file => log(`  - ${file.replace(process.cwd() + '/', '')}`));
  }
  
  let allPassed = true;
  const results = [];
  
  // 1. ESLint
  const lintCommand = isPreCommit && changedFiles.length > 0
    ? `npx eslint ${changedFiles.join(' ')}`
    : 'npm run lint';
    
  const lintResult = executeCommand(lintCommand, 'Running ESLint');
  results.push({ name: 'ESLint', success: lintResult.success });
  allPassed = allPassed && lintResult.success;
  
  // 2. TypeScript type checking
  const typecheckCommand = isPreCommit && changedFiles.length > 0
    ? `npx tsc --noEmit ${changedFiles.join(' ')}`
    : 'npm run typecheck';
    
  const typecheckResult = executeCommand(typecheckCommand, 'Running TypeScript type check');
  results.push({ name: 'TypeCheck', success: typecheckResult.success });
  allPassed = allPassed && typecheckResult.success;
  
  // 3. Test Coverage
  const coverageResult = executeCommand('npm run test:unit:coverage', 'Running test coverage check', { silent: true });
  
  // Parse coverage from output to check thresholds
  let coveragePassed = coverageResult.success;
  if (coverageResult.success && coverageResult.output) {
    const coverageMatch = coverageResult.output.match(/Statements\s*:\s*([\d.]+)%/);
    if (coverageMatch) {
      const coverage = parseFloat(coverageMatch[1]);
      const threshold = isPreCommit ? 25 : 30; // Lower threshold for pre-commit
      coveragePassed = coverage >= threshold;
      if (!coveragePassed) {
        logError(`Coverage ${coverage}% is below ${isPreCommit ? 'pre-commit' : 'CI'} threshold ${threshold}%`);
      } else {
        logSuccess(`Coverage ${coverage}% meets ${isPreCommit ? 'pre-commit' : 'CI'} threshold ${threshold}%`);
      }
    }
  }
  results.push({ name: 'Test Coverage', success: coveragePassed });
  allPassed = allPassed && coveragePassed;

  // 4. Tests
  if (isPreCommit) {
    const allTestFiles = getRelatedTestFiles(changedFiles);
    // Filter out integration tests for pre-commit (run only unit tests)
    const unitTestFiles = allTestFiles.filter(file => !file.includes('integration'));
    
    if (unitTestFiles.length > 0) {
      log(`🧪 Running ${unitTestFiles.length} unit tests (integration tests skipped in pre-commit)`, colors.blue);
      const testCommand = `VITEST_TEST_TYPE=unit npx vitest run ${unitTestFiles.join(' ')}`;
      const testResult = executeCommand(testCommand, 'Running related unit tests');
      results.push({ name: 'Unit Tests', success: testResult.success });
      allPassed = allPassed && testResult.success;
    } else {
      logWarning('No related unit test files found for changed files');
      results.push({ name: 'Unit Tests', success: true, skipped: true });
    }
    
    // Note about integration tests in pre-commit
    if (allTestFiles.length > unitTestFiles.length) {
      logWarning(`${allTestFiles.length - unitTestFiles.length} integration tests skipped (run 'npm run test:integration' to test them)`);
    }
  } else {
    // CI mode - run all tests
    const unitTestResult = executeCommand('npm run test:unit', 'Running unit tests');
    results.push({ name: 'Unit Tests', success: unitTestResult.success });
    allPassed = allPassed && unitTestResult.success;
    
    if (unitTestResult.success) {
      // Check if integration tests should run (requires database with applied migrations)
      const hasSupabaseCredentials = process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY;
      
      if (!hasSupabaseCredentials) {
        logWarning('Skipping integration tests: Supabase credentials not found');
        results.push({ name: 'Integration Tests', success: true, skipped: true });
      } else {
        logWarning('Integration tests require database with applied migrations from ../supabase/migrations/');
        const integrationTestResult = executeCommand('npm run test:integration', 'Running integration tests', {
          env: {
            ...process.env,
            // Ensure test environment variables are available
            VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
            VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
          }
        });
        results.push({ name: 'Integration Tests', success: integrationTestResult.success });
        allPassed = allPassed && integrationTestResult.success;
      }
    }
  }
  
  // Summary
  log('\n📊 Quality Gates Summary:', colors.bold);
  results.forEach(result => {
    if (result.skipped) {
      log(`  ${colors.yellow}⏭️  ${result.name}: Skipped${colors.reset}`);
    } else if (result.success) {
      log(`  ${colors.green}✅ ${result.name}: Passed${colors.reset}`);
    } else {
      log(`  ${colors.red}❌ ${result.name}: Failed${colors.reset}`);
    }
  });
  
  if (allPassed) {
    logSuccess('\n🎉 All quality gates passed!');
  } else {
    logError('\n💥 Some quality gates failed!');
  }
  
  return allPassed;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--pre-commit') ? 'pre-commit' : 'ci';
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Quality Gates Script

Usage:
  node scripts/quality-gates.js [options]

Options:
  --pre-commit    Run in pre-commit mode (only staged files)
  --help, -h      Show this help message

Examples:
  node scripts/quality-gates.js                # Full CI mode
  node scripts/quality-gates.js --pre-commit   # Pre-commit mode
    `);
    process.exit(0);
  }
  
  const success = await runQualityGates(mode);
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

export { runQualityGates };