import { useEffect, useState } from 'react'
import { getWalletHistory, shortHash } from '../services/xrpl'

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function IconCertificate() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12l2 2 4-4" />
      <path d="M12 2l3 1.5 3.3.2.2 3.3L20 10l-.8 3 .8 3-1.5 3-3.3.2-.2 3.3L12 22l-3-1.5-3.3-.2-.2-3.3L4 14l.8-3L4 8l1.5-3 3.3-.2.2-3.3L12 2z" />
    </svg>
  )
}

function IconChain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 14a5 5 0 007.07 0l3-3a5 5 0 00-7.07-7.07l-1.5 1.5" />
      <path d="M14 10a5 5 0 00-7.07 0l-3 3a5 5 0 007.07 7.07l1.5-1.5" />
    </svg>
  )
}

function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 01-2-2z" />
      <path d="M3 7V5a2 2 0 012-2h13a2 2 0 012 2v2" />
      <circle cx="17" cy="13" r="1" fill="currentColor" />
    </svg>
  )
}

function IconArrowOut() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="12" height="12">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

function IconRepo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7v12a2 2 0 002 2h14V5a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h12" />
    </svg>
  )
}

export default function DeploymentDetail({ deployment, onBack }) {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [nft, setNft] = useState(null)
  const [walletUrl, setWalletUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadHistory()
  }, [deployment.xrplWallet])

  async function loadHistory() {
    if (!deployment.xrplWallet) {
      setLoading(false)
      return
    }
    try {
      const { events, nft, walletUrl } = await getWalletHistory(deployment.xrplWallet)
      setEvents(events)
      setNft(nft)
      setWalletUrl(walletUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deployedAt = deployment.deployedAt
    ? new Date(deployment.deployedAt).toLocaleString('en-SA', { timeZone: 'Asia/Riyadh' })
    : '—'

  return (
    <div className="page detail-page">
      <header className="header">
        <div className="logo">wcloud<span className="dot">.sa</span></div>
        <button className="btn-back" onClick={onBack}>
          <IconBack /> Back to dashboard
        </button>
      </header>

      <main className="detail-main">
        <div className="detail-header">
          <div>
            <div className="detail-eyebrow">Deployment</div>
            <h1 className="detail-title">{deployment.projectName}</h1>
          </div>
          <span className="status-badge live">
            <span className="status-dot" /> Live
          </span>
        </div>

        <div className="detail-domain-card">
          {deployment.defaultHostname && (
            <div className="detail-domain-row" style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="card-label">Live URL</div>
                <a
                  href={`https://${deployment.defaultHostname}`}
                  target="_blank"
                  rel="noreferrer"
                  className="domain-value"
                  style={{ textDecoration: 'none' }}
                >
                  https://{deployment.defaultHostname}
                </a>
              </div>
              <span className="status-badge live">
                <span className="status-dot" /> Live
              </span>
            </div>
          )}
          <div className="detail-domain-row">
            <div>
              <div className="card-label">Custom domain</div>
              <div className="domain-value">https://{deployment.customDomain}</div>
            </div>
            <span className="domain-pending-badge">
              <span className="pending-dot" /> Pending activation
            </span>
          </div>
          <p className="contact-note" style={{ marginTop: '0.75rem', textAlign: 'left' }}>
            For custom domain configuration and activation, contact us at <a href="mailto:hello@wcloud.sa">hello@wcloud.sa</a>
          </p>
        </div>

        <div className="result-grid">
          <div className="result-card nft-card">
            <div className="card-title">
              <span className="card-icon"><IconCertificate /></span>
              Deployment Certificate
            </div>
            <div className="nft-body">
              <div className="nft-row">
                <span>Project</span>
                <strong>{deployment.projectName}</strong>
              </div>
              <div className="nft-row">
                <span>Deployed</span>
                <strong>{deployedAt}</strong>
              </div>
              <div className="nft-row">
                <span>Platform</span>
                <strong>wcloud.sa</strong>
              </div>
              <div className="nft-row">
                <span>Issuer</span>
                <strong>wcloud.sa</strong>
              </div>
              <div className="nft-row">
                <span>NFT Hash</span>
                <strong className="mono">{nft ? shortHash(nft.hash) : (loading ? 'Loading...' : '—')}</strong>
              </div>
            </div>
            {nft && (
              <a href={nft.url} target="_blank" rel="noreferrer" className="btn-verify">
                Verify on XRPL Explorer <IconArrowOut />
              </a>
            )}
          </div>

          <div className="result-card audit-card">
            <div className="card-title">
              <span className="card-icon"><IconChain /></span>
              On-Chain Audit Trail
            </div>
            <div className="audit-desc">
              Every deployment event is permanently recorded on the XRP Ledger. Tamper-proof and verifiable by anyone.
            </div>
            {loading && <div className="dashboard-loading" style={{ padding: '0.5rem 0' }}>Loading from XRPL...</div>}
            {!loading && events.length === 0 && !error && (
              <div className="audit-desc">No on-chain events recorded.</div>
            )}
            {error && <div className="error">{error}</div>}
            <div className="audit-events">
              {events.map((ev, i) => (
                <div key={i} className="audit-event">
                  <div className="audit-event-top">
                    <span className="audit-dot" />
                    <span className="audit-label">{ev.label}</span>
                  </div>
                  <a href={ev.url} target="_blank" rel="noreferrer" className="audit-hash">
                    TX {shortHash(ev.hash)} <IconArrowOut />
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="result-card wallet-card">
            <div className="card-title">
              <span className="card-icon"><IconWallet /></span>
              XRPL Deployment Wallet
            </div>
            <div className="wallet-info">
              <div className="nft-row">
                <span>Network</span>
                <strong>XRPL Testnet</strong>
              </div>
              <div className="nft-row">
                <span>Address</span>
                <strong className="mono">{deployment.xrplWallet ? shortHash(deployment.xrplWallet) : '—'}</strong>
              </div>
              <div className="nft-row">
                <span>Events recorded</span>
                <strong>{events.length} {events.length === 1 ? 'transaction' : 'transactions'}</strong>
              </div>
              <div className="nft-row">
                <span>NFT minted</span>
                <strong>{nft ? '1 certificate' : '—'}</strong>
              </div>
            </div>
            {walletUrl && (
              <a href={walletUrl} target="_blank" rel="noreferrer" className="btn-verify">
                View wallet on XRPL <IconArrowOut />
              </a>
            )}
          </div>

          <div className="result-card wallet-card">
            <div className="card-title">
              <span className="card-icon"><IconRepo /></span>
              Source Repository
            </div>
            <div className="wallet-info">
              <div className="nft-row">
                <span>Repository</span>
                <strong className="mono">{deployment.repoUrl?.replace('https://github.com/', '') || '—'}</strong>
              </div>
              <div className="nft-row">
                <span>Resource name</span>
                <strong className="mono">{deployment.appName}</strong>
              </div>
            </div>
            {deployment.repoUrl && (
              <a href={deployment.repoUrl} target="_blank" rel="noreferrer" className="btn-verify">
                View on GitHub <IconArrowOut />
              </a>
            )}
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
