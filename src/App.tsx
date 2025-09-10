import { useState } from 'react'
import './App.css'

function App() {
  const [version] = useState('1.0.0')

  return (
    <div className="App">
      <div className="card">
        <h1>Marmaid</h1>
        <p>Visualization tool for Marma points for therapists</p>
        <div className="version-info">
          <p>Version: {version}</p>
          <p>Status: Development</p>
        </div>
        <div className="links">
          <a href="/frontend" target="_blank" rel="noopener noreferrer">
            Go to Application →
          </a>
        </div>
      </div>
    </div>
  )
}

export default App