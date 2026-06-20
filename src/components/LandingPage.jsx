const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liKHLBYkHzIomvc9'

export default function LandingPage({ onDeploy }) {
  function connectGitHub() {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      scope: 'repo workflow read:user',
    })
    window.location.href = `https://github.com/login/oauth/authorize?${params}`
  }

  return (
    <div className="page landing">
      <header className="header">
        <div className="logo">wcloud<span className="dot">.sa</span></div>
        <span className="badge">Verified on XRPL</span>
      </header>

      <main className="hero">
        <div className="hero-content">
          <h1>You deploy.<br />We take control.</h1>
          <p className="subtitle">
            Connect your GitHub account, pick a repository, and ship to the cloud in seconds. Every deployment event permanently recorded on the XRP Ledger.
          </p>

          <button className="btn-github" onClick={connectGitHub}>
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Continue with GitHub
          </button>

          <p className="oauth-note">
            wcloud.sa requests read access to your repositories only.
          </p>
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V8" />
                <path d="M9 11l3-3 3 3" />
                <path d="M3 15a4 4 0 014-4 5 5 0 019.9-1A4 4 0 0121 14a4 4 0 01-4 4H7a4 4 0 01-4-3z" />
              </svg>
            </div>
            <div>
              <strong>Fully Managed Deployments</strong>
              <span>Push your code, we handle the infrastructure end to end.</span>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 14a5 5 0 007.07 0l3-3a5 5 0 00-7.07-7.07l-1.5 1.5" />
                <path d="M14 10a5 5 0 00-7.07 0l-3 3a5 5 0 007.07 7.07l1.5-1.5" />
              </svg>
            </div>
            <div>
              <strong>On-Chain Audit Trail</strong>
              <span>Every deployment event written immutably to the XRP Ledger.</span>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <path d="M12 2l3 1.5 3.3.2.2 3.3L20 10l-.8 3 .8 3-1.5 3-3.3.2-.2 3.3L12 22l-3-1.5-3.3-.2-.2-3.3L4 14l.8-3L4 8l1.5-3 3.3-.2.2-3.3L12 2z" />
              </svg>
            </div>
            <div>
              <strong>Verified Certificate</strong>
              <span>A tamper-proof NFT certificate, verifiable by anyone forever.</span>
            </div>
          </div>
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
