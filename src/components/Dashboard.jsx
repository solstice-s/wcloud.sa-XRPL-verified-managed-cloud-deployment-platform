import { useEffect, useState } from 'react'

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconCloud() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 15a4 4 0 014-4 5 5 0 019.9-1A4 4 0 0121 14a4 4 0 01-4 4H7a4 4 0 01-4-3z" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

export default function Dashboard({ user, onNewDeploy, onLogout, onOpenDeployment }) {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDeployments()
  }, [])

  async function fetchDeployments() {
    try {
      const res = await fetch(`/api/deployments?clientLogin=${encodeURIComponent(user.login)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load deployments')
      setDeployments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleString('en-SA', { timeZone: 'Asia/Riyadh', dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <div className="page landing">
      <header className="header">
        <div className="logo">wcloud<span className="dot">.sa</span></div>
        <div className="user-pill">
          {user?.avatar && <img src={user.avatar} alt={user.login} className="avatar" />}
          <span>{user?.name || user?.login}</span>
          <button className="btn-icon" onClick={onLogout} title="Sign out">
            <IconLogout />
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Your Deployments</h1>
            <p className="dashboard-subtitle">
              {deployments.length} {deployments.length === 1 ? 'project' : 'projects'} hosted on wcloud.sa
            </p>
          </div>
          <button className="btn-primary btn-new-deploy" onClick={onNewDeploy}>
            <IconPlus />
            Deploy new project
          </button>
        </div>

        {loading && <div className="dashboard-loading">Loading deployments...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && deployments.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon"><IconCloud /></div>
            <h2>No deployments yet</h2>
            <p>Deploy your first project to get started.</p>
            <button className="btn-primary" onClick={onNewDeploy}>
              <IconPlus /> Deploy your first project
            </button>
          </div>
        )}

        <div className="deployments-grid">
          {deployments.map(dep => (
            <button
              key={dep.appName}
              className="deployment-card deployment-card-clickable"
              onClick={() => onOpenDeployment(dep)}
              type="button"
            >
              <div className="deployment-top">
                <div className="deployment-name">{dep.projectName}</div>
                <span className="status-badge live">
                  <span className="status-dot" /> Live
                </span>
              </div>
              <div className="deployment-domain">
                {dep.customDomain}
              </div>
              <div className="deployment-meta">
                <span>Deployed {formatDate(dep.deployedAt)}</span>
              </div>
              <div className="deployment-actions">
                <span className="link-quiet">View details →</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="page-footer">
        <span>&copy; 2026 wcloud.sa</span>
        <span className="footer-sep">·</span>
        <span>Riyadh, Saudi Arabia</span>
      </footer>
    </div>
  )
}
