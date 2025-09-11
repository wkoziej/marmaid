import './App.css';
import { useState } from 'react';

// Get build-time git info injected by Vite
declare const __GIT_INFO__: {
  commit: string;
  branch: string;
  date: string;
};

interface DevInfoProps {
  gitInfo: {
    commit: string;
    branch: string;
    date: string;
  };
  environment: string;
  databaseEnv: string;
  supabaseUrl: string;
}

function DevInfoHeader({
  gitInfo,
  environment,
  databaseEnv,
  supabaseUrl,
}: DevInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      toggleExpanded();
    }
  };

  const shortCommit =
    gitInfo.commit.length > 7 ? gitInfo.commit.substring(0, 7) : gitInfo.commit;
  const shortDbInfo = databaseEnv
    .replace(' Database', '')
    .replace(' Development', ' Dev');

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid='dev-info-container'
    >
      {/* Compact header */}
      <div
        className='dev-info-compact'
        data-testid='dev-info-compact-header'
        onClick={toggleExpanded}
        style={{
          cursor: 'pointer',
          fontSize: 'clamp(0.75em, 2vw, 0.85em)',
          color: '#666',
          marginBottom: '1rem',
          fontFamily: 'monospace',
          wordBreak: 'break-word',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        🔧 DEV: v.{shortCommit} | {environment} | {shortDbInfo}
      </div>

      {/* Expandable detailed view */}
      {isExpanded && (
        <div
          className='dev-info-detailed'
          data-testid='dev-info-detailed-view'
          style={{
            marginBottom: '1rem',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Developer Information</strong>
          </div>
          <div
            style={{
              fontSize: 'clamp(0.8em, 1.8vw, 0.9em)',
              lineHeight: '1.4',
              wordBreak: 'break-word',
            }}
          >
            <p data-testid='version-display' style={{ margin: '0.2em 0' }}>
              <strong>Version:</strong>{' '}
              <span style={{ fontFamily: 'monospace' }}>{gitInfo.commit}</span>
            </p>
            <p data-testid='environment-display' style={{ margin: '0.2em 0' }}>
              <strong>Environment:</strong> {environment}
            </p>
            <p data-testid='branch-display' style={{ margin: '0.2em 0' }}>
              <strong>Branch:</strong>{' '}
              <span style={{ fontFamily: 'monospace' }}>{gitInfo.branch}</span>
            </p>
            <p data-testid='build-date-display' style={{ margin: '0.2em 0' }}>
              <strong>Built:</strong> {gitInfo.date}
            </p>
            <p data-testid='database-display' style={{ margin: '0.2em 0' }}>
              <strong>Database:</strong> {databaseEnv}
            </p>
            <p
              data-testid='database-url-display'
              style={{
                margin: '0.2em 0',
                fontFamily: 'monospace',
                fontSize: '0.85em',
                wordBreak: 'break-all',
              }}
            >
              <strong>DB URL:</strong>{' '}
              {supabaseUrl.replace('https://', '').replace('.supabase.co', '')}
            </p>
            <p
              style={{
                fontSize: 'clamp(0.7em, 1.5vw, 0.8em)',
                color: '#888',
                marginTop: '0.5rem',
                lineHeight: '1.2',
              }}
            >
              Press Ctrl+D to toggle • Click header to expand/collapse
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const gitInfo = (
    globalThis as typeof globalThis & { __GIT_INFO__?: typeof __GIT_INFO__ }
  ).__GIT_INFO__ ||
    __GIT_INFO__ || {
      commit: 'unknown',
      branch: 'unknown',
      date: 'unknown',
    };

  // Determine environment based on branch and env vars
  const environment =
    import.meta.env.VITE_ENVIRONMENT ||
    (gitInfo.branch === 'main'
      ? 'Production'
      : gitInfo.branch === 'test'
        ? 'Test'
        : 'Development');

  // Get database info
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured';
  const getDatabaseEnv = (url: string) => {
    if (url === 'Not configured') return 'Local Development';
    if (url.includes('myxicttnpflkwnofbhci')) return 'Test Database';
    if (url.includes('aajurxtbngbixsdptfzz')) return 'Production Database';
    return 'Unknown Database';
  };

  return (
    <div className='App'>
      <div className='card'>
        <h1 data-testid='app-title'>Marmaid</h1>
        <p data-testid='app-description'>
          Visualization tool for Marma points for therapists
        </p>
        <DevInfoHeader
          gitInfo={gitInfo}
          environment={environment}
          databaseEnv={getDatabaseEnv(supabaseUrl)}
          supabaseUrl={supabaseUrl}
        />
      </div>
    </div>
  );
}

export default App;
