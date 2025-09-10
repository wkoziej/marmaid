import './App.css'

// Get build-time git info injected by Vite
declare const __GIT_INFO__: {
  commit: string
  branch: string
  date: string
}

function App() {
  const gitInfo = (globalThis as typeof globalThis & { __GIT_INFO__?: typeof __GIT_INFO__ }).__GIT_INFO__ || __GIT_INFO__ || {
    commit: 'unknown',
    branch: 'unknown', 
    date: 'unknown'
  }

  // Determine environment based on branch and env vars
  const environment = import.meta.env.VITE_ENVIRONMENT || 
    (gitInfo.branch === 'main' ? 'Production' : 
     gitInfo.branch === 'test' ? 'Test' : 'Development')

  // Get database info
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured'
  const getDatabaseEnv = (url: string) => {
    if (url === 'Not configured') return 'Local Development'
    if (url.includes('myxicttnpflkwnofbhci')) return 'Test Database'
    if (url.includes('aajurxtbngbixsdptfzz')) return 'Production Database'
    return 'Unknown Database'
  }

  return (
    <div className="App">
      <div className="card">
        <h1 data-testid="app-title">Marmaid</h1>
        <p data-testid="app-description">Visualization tool for Marma points for therapists</p>
        <div className="version-info" data-testid="version-info">
          <p data-testid="version-display"><strong>Version:</strong> {gitInfo.commit}</p>
          <p data-testid="environment-display"><strong>Environment:</strong> {environment}</p>
          <p data-testid="branch-display"><strong>Branch:</strong> {gitInfo.branch}</p>
          <p data-testid="build-date-display"><strong>Built:</strong> {gitInfo.date}</p>
          <p data-testid="database-display"><strong>Database:</strong> {getDatabaseEnv(supabaseUrl)}</p>
          <p data-testid="database-url-display"><strong>DB URL:</strong> {supabaseUrl.replace('https://', '').replace('.supabase.co', '')}</p>
        </div>
        <div className="links">
          <a href="/frontend" target="_blank" rel="noopener noreferrer" data-testid="app-navigation-link">
            Go to Application →
          </a>
        </div>
      </div>
    </div>
  )
}

export default App