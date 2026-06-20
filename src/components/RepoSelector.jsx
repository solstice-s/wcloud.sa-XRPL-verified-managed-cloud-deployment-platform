import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE

export default function RepoSelector({ user, token, onSelect }) {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [projectName, setProjectName] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRepos()
  }, [])

  async function fetchRepos() {
    try {
      const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/vnd.github+json'
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      const simplified = data.map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        url: r.html_url,
        description: r.description,
        private: r.private,
        language: r.language,
        defaultBranch: r.default_branch,
        updatedAt: r.updated_at
      }))
      setRepos(simplified)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(repo) {
    setSelected(repo)
    setProjectName(repo.name)
  }

  function handleDeploy() {
    if (!selected || !projectName.trim()) return
    onSelect({
      projectName: projectName.trim(),
      repoUrl: selected.url,
      branch: selected.defaultBranch,
      language: selected.language
    })
  }

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page landing">
      <header className="header">
        <div className="logo">wcloud<span className="dot">.sa</span></div>
        <div className="user-pill">
          {user?.avatar && (
            <img src={user.avatar} alt={user.login} className="avatar" />
          )}
          <span>{user?.name || user?.login}</span>
        </div>
      </header>

      <main className="hero" style={{ maxWidth: 720 }}>
        <div className="hero-content">
          <div className="tag">Step 1 of 2 — Select Repository</div>
          <h1 style={{ fontSize: '1.8rem' }}>Which repo do you want to deploy?</h1>

          <input
            className="search-input"
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {loading && <p className="deploy-status">Loading repositories...</p>}
          {error && <p className="error">{error}</p>}

          <div className="repo-list">
            {filtered.map(repo => (
              <div
                key={repo.id}
                className={`repo-card ${selected?.id === repo.id ? 'selected' : ''}`}
                onClick={() => handleSelect(repo)}
              >
                <div className="repo-top">
                  <span className="repo-name">{repo.name}</span>
                  {repo.private && <span className="repo-tag">Private</span>}
                  {repo.language && (
                    <span className="repo-tag lang">{repo.language}</span>
                  )}
                </div>
                {repo.description && (
                  <p className="repo-desc">{repo.description}</p>
                )}
                <span className="repo-branch">branch: {repo.defaultBranch}</span>
              </div>
            ))}
          </div>

          {selected && (
            <div className="deploy-form" style={{ marginTop: '1.5rem' }}>
              <div className="field">
                <label>Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. salon-flow"
                />
              </div>
              <button className="btn-primary" onClick={handleDeploy}>
                Deploy {selected.name} to Azure + XRPL
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
