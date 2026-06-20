import { shortHash } from '../services/xrpl'

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

export default function SuccessPage({ projectName, repoUrl, result, onReset }) {
  const { wallet, xrplEvents, nft, liveUrl } = result
  const nftEvent = xrplEvents.find(e => e.label === 'NFT Certificate Minted')
  const auditEvents = xrplEvents.filter(e => e.label !== 'NFT Certificate Minted')
  const deployedAt = new Date().toLocaleString('en-SA', { timeZone: 'Asia/Riyadh' })

  const customDomain = `${projectName.toLowerCase().replace(/\s+/g, '-')}.platform.wcloud.sa`
  const hasRealUrl = liveUrl && !liveUrl.includes('platform.wcloud.sa')

  return (
    <div className="page success">
      <header className="header">
        <div className="logo">wcloud<span className="dot">.sa</span></div>
        <span className="badge success-badge">Deployment Complete</span>
      </header>

      <main className="success-main">
        <div className="success-hero">
          <div className="checkmark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-9" />
            </svg>
          </div>
          <h1>Your app is live</h1>
          {hasRealUrl && (
            <a href={liveUrl} target="_blank" rel="noreferrer" className="live-url">
              {liveUrl}
            </a>
          )}
          <div className="custom-domain-pending" style={{ marginTop: hasRealUrl ? '0.75rem' : 0 }}>
            <span className="pending-dot" />
            Custom domain <strong>https://{customDomain}</strong> being configured by wcloud.sa
          </div>
          <p className="contact-note">
            To activate your custom domain, contact us at <a href="mailto:hello@wcloud.sa">hello@wcloud.sa</a>
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
                <strong>{projectName}</strong>
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
                <strong className="mono">{nftEvent ? shortHash(nftEvent.hash) : '—'}</strong>
              </div>
            </div>
            {nftEvent && (
              <a href={nftEvent.url} target="_blank" rel="noreferrer" className="btn-verify">
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
            <div className="audit-events">
              {auditEvents.map((ev, i) => (
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
                <strong className="mono">{wallet ? shortHash(wallet.address) : '—'}</strong>
              </div>
              <div className="nft-row">
                <span>Events recorded</span>
                <strong>{auditEvents.length} transactions</strong>
              </div>
              <div className="nft-row">
                <span>NFT minted</span>
                <strong>1 certificate</strong>
              </div>
            </div>
            {wallet && (
              <a
                href={`https://testnet.xrpl.org/accounts/${wallet.address}`}
                target="_blank"
                rel="noreferrer"
                className="btn-verify"
              >
                View wallet on XRPL <IconArrowOut />
              </a>
            )}
          </div>
        </div>

        <div className="success-footer">
          <div className="footer-summary">
            <strong>{xrplEvents.length} XRPL transactions</strong> recorded, <strong>1 NFT</strong> minted, and your deployment is verified on-chain.
          </div>
          <button className="btn-secondary" onClick={onReset}>
            Deploy another project
          </button>
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
